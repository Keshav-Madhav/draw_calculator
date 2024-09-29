import { useEffect, useRef, useState } from "react"
import { SWATCHES } from "@/constanst"
import { ColorSwatch, Group } from "@mantine/core"
import { Button } from "@/components/ui/button"
import axios from "axios";
import Draggable from "react-draggable";
interface Response {
  expr: string
  result: string
  assign: boolean
}

interface GeneratedResult {
  expression: string
  answer: string
}

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(SWATCHES[1])
  const [reset, setReset] = useState(false)
  const [result, setResult] = useState<GeneratedResult>()
  const [expression, setExpression] = useState<{latex: string, value: string}[]>([{latex: 'hehehehe', value: 'hehehehe'}])
  const [LatexPosition, setLatexPosition] = useState({x: 10, y: 100})
  const [dictOfVars, setDictOfVars] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if(reset){
      resetCanvas()
      setReset(false)
      setExpression([])
      setResult(undefined)
      setDictOfVars({})
    }
  }, [reset]);

  useEffect(() => {
    if(result){
      renderLatexToCanvas(result.expression, result.answer)
    }
  }, [result])

  useEffect(() => {
    if(expression.length > 0 && window.MathJax){
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub])
      }, 0)
    }
  }, [expression])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - canvas.offsetTop;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML"
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {inlineMath: [['$', '$'], ['\\(', '\\)']]}
      })
    }

    return () => {
      document.head.removeChild(script);
    }
  }, []);
  
  const resetCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return;

    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return;

    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    canvas.style.background = 'black';
    canvas.style.cursor = 'crosshair';

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  }

  const stopDrawing = () => {
    setIsDrawing(false);
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current
    if (!canvas) return;

    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  const renderLatexToCanvas = (express: string, answer: string | number): void => {
    // Function to add spaces between words and around operators
    const addSpaces = (str: string): string => {
      return str.replace(/(\w+)([+\-*/=])?/g, (_, word, operator) => {
        if (operator) {
          return `\\;${word}\\;${operator}\\;`;
        }
        return `\\;${word}\\;`;
      }).trim();
    };
  
    // Function to handle line breaks and indentation for equal signs
    const addLineBreaks = (str: string): string => {
      // Replace all equal signs with line break and indentation
      return str.replace(/=/g, '\\;=\\\\ \\quad');
    };
  
    // Format the expression and answer
    const formattedExpress: string = addLineBreaks(addSpaces(express));
    const formattedAnswer = typeof answer === 'number' ? answer : addLineBreaks(addSpaces(answer));
  
    // Construct the final LaTeX string
    const latex: string = `\\(\\LARGE{${formattedExpress} =\\\\ \\quad${formattedAnswer}}\\)`;
  
    // Append the LaTeX to the expression list
    setExpression((prevExpression) => [...prevExpression, {latex, value: `${express} = ${answer}`}]);
  };  

  const handleClick = (latex: string) => {
    navigator.clipboard.writeText(latex);
    alert('Copied to clipboard');
  }

  const sendData = async () => {
    const canvas = canvasRef.current
    if (!canvas) return;

    setLoading(true)

    const response = await axios({
      method: 'POST',
      url: `${import.meta.env.VITE_API_URL}/calculate`,
      data :{
        image: canvas.toDataURL('image/png'),
        dict_of_vars: dictOfVars
      }
    });

    const resp = await response.data;
    resp.data.forEach((data: Response) => {
      if(data.assign) {
        setDictOfVars({...dictOfVars, [data.expr]: data.result})
      }
    });

    setLoading(false)
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
    let minX = canvas.width, maxY = 0;
    let minY = canvas.height;
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            if (imageData.data[i + 3] > 0) {  // If pixel is not transparent
                minX = Math.min(minX, x);
                maxY = Math.max(maxY, y);
                minY = Math.min(minY, y);
            }
        }
    }
    const LeftX = minX;
    const bottomLeftY = maxY;
    const topLeftY = minY;
    if(bottomLeftY > window.innerHeight - 100) {
      setLatexPosition({ x: LeftX, y: topLeftY });
    } else {
      setLatexPosition({ x: LeftX, y: bottomLeftY });
    }

    resp.data.forEach((data: Response) => {
        setTimeout(() => {
            setResult({
                expression: data.expr,
                answer: data.result
            });
        }, 1000);
    });
  }

  return (
    <>
    <div className="grid grid-cols-3 gap-6 py-2 px-6">
      <Button
        onClick={() => setReset(true)}
        className="z-20 bg-black text-white"
        variant='default'
        color="black"
      >
        Reset
      </Button>

      <Group className="z-20">
        {SWATCHES.map((swatch, index) => (
          <ColorSwatch
            key={index}
            color={swatch}
            onClick={() => setColor(swatch)}
            className="cursor-pointer"
          />
        ))}
      </Group>  
      
      <Button
        onClick={sendData}
        className="z-20 bg-black text-white"
        variant='default'
        color="black"
      >
        {loading ? 'Loading...' : 'Calculate'}
      </Button>
    </div>
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        id='canvas'
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
      />

      {expression && expression.map((latex, index) => (
        <Draggable 
          key={index} 
          defaultPosition={{x: LatexPosition.x, y: LatexPosition.y}} 
          onStop={(_, data) => setLatexPosition({x: data.x, y: data.y})}
        > 
          <div className="absolute flex flex-col gap-2">
            <div className="flex gap-2">
              <div 
                className="text-xs text-gray-300 bg-transparent border w-fit px-2 rounded-full hover:bg-gray-500/20 cursor-pointer"
                onClick={() => handleClick(latex.value)}
              >
                Copy
              </div>

              <div 
                className="text-xs text-gray-300 bg-transparent border w-fit px-2 rounded-full hover:bg-gray-500/20 cursor-pointer"
                onClick={() => setExpression(expression.filter((_, i) => i !== index))}
              >
                Remove
              </div>
            </div>

            <div className="latex-content z-10 text-white">{latex.latex}</div>
          </div>
        </Draggable>
      ))}
    </>
  )
}
export default Home