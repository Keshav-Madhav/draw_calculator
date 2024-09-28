import { useEffect, useRef, useState } from "react"
import { SWATCHES } from "@/constanst"
import { ColorSwatch, Group } from "@mantine/core"
import { Button } from "@/components/ui/button"
import axios from "axios";

interface Response {
  expr: string
  result: string
  assing: boolean
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
  const [dictOfVars, setDictOfVars] = useState({})

  useEffect(() => {
    if(reset){
      resetCanvas()
      setReset(false)
    }
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - canvas.offsetTop;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
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

  const sendData = async () => {
    const canvas = canvasRef.current
    if (!canvas) return;

    const response = await axios({
      method: 'POST',
      url: `${import.meta.env.VITE_API_URL}/calculate`,
      data :{
        image: canvas.toDataURL('image/png'),
        dict_of_vars: dictOfVars
      }
    });

    const resp = await response.data 
    setResult(resp)
    console.log(resp)
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
        Calculate
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
    </>
  )
}
export default Home