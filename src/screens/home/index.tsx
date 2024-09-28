import { useEffect, useRef, useState } from "react"

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

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

    ctx.strokeStyle = 'white';
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  return (
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
  )
}
export default Home