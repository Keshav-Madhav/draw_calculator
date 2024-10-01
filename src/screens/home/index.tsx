import { useEffect, useRef, useState } from "react"
import { SWATCHES } from "@/constanst"
import { ColorSwatch, Group, Image } from "@mantine/core"
import { Button } from "@/components/ui/button"
import axios from "axios";
import Draggable from "react-draggable";
import { Slider } from "@/components/ui/slider"

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
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [reset, setReset] = useState(false)
  const [result, setResult] = useState<GeneratedResult>()
  const [expression, setExpression] = useState<{latex: string, value: string}[]>([])
  const [LatexPosition, setLatexPosition] = useState({x: 10, y: 100})
  const [dictOfVars, setDictOfVars] = useState({})
  const [loading, setLoading] = useState(false)
  const [lastStroke, setLastStroke] = useState<ImageData | null>(null)
  const [undoneStroke, setUndoneStroke] = useState<ImageData | null>(null)
  const [insertText, setInsertText] = useState(false)
  const [text, setText] = useState('')
  const [inputWidth, setInputWidth] = useState(240);
  const [inputPosition, setInputPosition] = useState({ x: 10, y: 50 });
  const measureRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (measureRef.current) {
      const width = measureRef.current.offsetWidth;
      setInputWidth(Math.max(240, width + 20)); // Add some padding
    }
  }, [text]);

  useEffect(() => {
    if(reset){
      resetCanvas()
      setReset(false)
      setResult(undefined)
      setDictOfVars({})
      setLastStroke(null)
      setUndoneStroke(null)
      setColor(SWATCHES[1])
      setStrokeWidth(3)
      setText('')
      setInsertText(false)
      setInputWidth(240)
      setInputPosition({ x: 10, y: 50 })
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
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z' && lastStroke) {
        console.log('undo')
        undo()
      } else if (e.ctrlKey && e.key === 'y' && undoneStroke) {
        console.log('redo')
        redo()
      }
    })

    return () => {
      window.removeEventListener('keydown', () => {})
    }
  }, [])
  
  const resetCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return;

    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const undo = () => {
    const canvas = canvasRef.current
    if (!canvas || !lastStroke) return;

    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    setUndoneStroke(ctx.getImageData(0, 0, canvas.width, canvas.height))
    ctx.putImageData(lastStroke, 0, 0)
    setLastStroke(null)
  }

  const redo = () => {
    const canvas = canvasRef.current
    if (!canvas || !undoneStroke) return;

    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    setLastStroke(ctx.getImageData(0, 0, canvas.width, canvas.height))
    ctx.putImageData(undoneStroke, 0, 0)
    setUndoneStroke(null)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return;

    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    canvas.style.background = 'black';
    canvas.style.cursor = 'crosshair';

    setLastStroke(ctx.getImageData(0, 0, canvas.width, canvas.height))
    setUndoneStroke(null)

    ctx.beginPath();
    
    if (e.type === 'mousedown') {
      const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
      ctx.moveTo(mouseEvent.nativeEvent.offsetX, mouseEvent.nativeEvent.offsetY);
    } else if (e.type === 'touchstart') {
      const touchEvent = e as React.TouchEvent<HTMLCanvasElement>;
      const touch = touchEvent.touches[0];
      const rect = canvas.getBoundingClientRect();
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    }

    setIsDrawing(true);
  }

  const stopDrawing = () => {
    setIsDrawing(false);
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current
    if (!canvas) return;

    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;

    if (e.type === 'mousemove') {
      const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
      ctx.lineTo(mouseEvent.nativeEvent.offsetX, mouseEvent.nativeEvent.offsetY);
    } else if (e.type === 'touchmove') {
      const touchEvent = e as React.TouchEvent<HTMLCanvasElement>;
      const touch = touchEvent.touches[0];
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    }

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
      if(str.length < 20) return str;
      return str.replace(/=/g, '\\;=\\\\ \\quad');
    };
  
    // Format the expression and answer
    const formattedExpress: string = addLineBreaks(addSpaces(express));
    const formattedAnswer = typeof answer === 'number' ? answer : addLineBreaks(addSpaces(answer));
  
    // Construct the final LaTeX string
    const totalLength = formattedExpress.length + formattedAnswer.toString().length;
    const latex: string = totalLength > 50
      ? `\\(\\LARGE{${formattedExpress} =\\\\ \\quad${formattedAnswer}}\\)`
      : `\\(\\LARGE{${formattedExpress} = ${formattedAnswer}}\\)`;
  
    // Append the LaTeX to the expression list
    setExpression((prevExpression) => [...prevExpression, {latex, value: `${express} = ${answer}`}]);
  };  

  const handleClick = (latex: string) => {
    navigator.clipboard.writeText(latex);
    alert('Copied to clipboard');
  }

  const drawTextOnCanvas = (text: string, x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set the font properties
    ctx.font = '20px Arial'; // Adjust size and font as needed
    ctx.fillStyle = color; // Use the current selected color

    // Draw the text on the canvas
    ctx.fillText(text, x, y);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Get the current position of the input field
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const x = inputPosition.x - canvasRect.left + 9;
        const y = inputPosition.y - canvasRect.top + 78;

        // Draw the text on the canvas
        drawTextOnCanvas(text, x, y);

        // Reset the input field and hide it
        setText('');
        setInsertText(false);
        setInputPosition({ x: 10, y: 50 });
        setInputWidth(240);
      }
    }
  };

  const downloadCanvasAsImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'canvas-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
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
    <div className="flex items-center justify-around gap-6 h-14 px-6 bg-gray-800 z-20">
      <Button
        onClick={() => setReset(true)}
        className="z-20 bg-black w-fit h-10"
        variant='default'
        color="black"
      >
        <Image src="/undo.png" alt="Reset" className="w-10 h-12" />
        <p className="font-sans text-3xl text-[#574a3a]">Reset</p>
      </Button>
      
      <Button 
        onClick={() => setInsertText(true)}
        className="z-20 bg-black w-fit h-10 flex gap-1 items-center"
        variant='default'
        color="black"
      >
        <Image src="/text.png" alt="Text" className="w-7 h-7" />
        <p className="font-sans text-3xl text-[#d6a426]">Text</p>
      </Button>

      <Button
        onClick={() => setColor('black')}
        className="z-20 bg-black w-fit h-10 flex items-center gap-2"
        variant='default'
        color="black"
      >
        <Image src="/eraser.png" alt="Eraser" className="w-8 h-6" />
        <p className="font-sans text-2xl text-[#f6b2c7]">Eraser</p>
      </Button>

      <Group className="z-20 flex flex-nowrap">
        {SWATCHES.map((swatch, index) => (
          <ColorSwatch
            key={index}
            color={swatch}
            onClick={() => setColor(swatch)}
            className="cursor-pointer"
          />
        ))}
      </Group> 

      <div className="flex gap-2 items-center w-[15rem]">
        <p className="text-white font-sans text-sm">Width: </p>

        <Slider 
          defaultValue={[strokeWidth]}
          onValueChange={(value) => setStrokeWidth(value[0])}
          min={1}
          max={20} 
          step={1} 
          className="w-[10rem]"
        />

        <p className="text-white font-sans text-2xl">{strokeWidth}</p>
      </div>

      <Button
        onClick={downloadCanvasAsImage}
        className="z-20 bg-black w-fit h-10"
        variant='default'
        color="black"
      >
        <Image src="/download.png" alt="download" className="w-9 h-9" />
        <p className="font-sans text-2xl text-[#b7eb32]">Download</p>
      </Button>
      
      <Button
        onClick={sendData}
        className="z-20 bg-gray-300 hover:bg-gray-400 w-fit h-10 font-sans flex items-center gap-2"
        variant='default'
        color="black"
      >
        <Image src="/equal.png" alt="Calculate" className="w-8 h-8" />
        <p className="font-sans text-3xl text-black">{loading ? 'Loading...' : 'Calculate'}</p>
      </Button>
    </div>

      <canvas 
        ref={canvasRef}
        className="absolute top-14 left-0 w-full h-[calc(100%-3.5rem)]"
        id='canvas'
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        onTouchMove={draw}
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

              <div 
                className="text-xs text-gray-300 bg-transparent border w-fit px-2 rounded-full hover:bg-gray-500/20 cursor-pointer"
                onClick={() => {
                  drawTextOnCanvas(`Response: ${latex.value}`, LatexPosition.x, LatexPosition.y)
                  setExpression(expression.filter((_, i) => i !== index))
                }}
              >
                Insert
              </div>
            </div>

            <div className="latex-content z-10 text-white cursor-move">{latex.latex}</div>
          </div>
        </Draggable>
      ))}

      {insertText && (
        <Draggable 
          defaultPosition={{x: inputPosition.x, y: inputPosition.y}} 
          onStop={(_, data) => setInputPosition({x: data.x, y: data.y})}
        >
          <div className="relative cursor-move">
            <input 
              type="text" 
              className="absolute h-fit bg-transparent border rounded-lg z-20 text-white text-xl px-2"
              style={{
                width: `${inputWidth}px`,
                color: color,
                borderColor: color
              }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              title="Enter text to insert"
              placeholder="Enter text to insert"
            />
            <p className="absolute top-8 text-gray-500">Press Enter to insert.</p>
            <span 
              ref={measureRef}
              className="absolute invisible whitespace-pre text-xl px-2"
            >
              {text || "Enter text to insert"}
            </span>
          </div>
        </Draggable>
      )}
    </>
  )
}
export default Home