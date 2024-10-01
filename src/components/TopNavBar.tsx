import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowDown } from "lucide-react";
import { ColorSwatch, Image } from "@mantine/core"
import { Button } from "@/components/ui/button"
import { SWATCHES } from "@/constanst";

type Props = {
  setReset: (value: boolean) => void
  setInsertText: (value: boolean) => void
  setColor: (value: string) => void
  setStrokeWidth: (value: number) => void
  downloadCanvasAsImage: () => void
  sendData: () => void
  color: string
  strokeWidth: number
  loading: boolean
}

const TopNavBar = ({ setReset, setInsertText, setColor, setStrokeWidth, downloadCanvasAsImage, sendData, color, strokeWidth, loading }: Props) => {
  return (
    <div className="flex items-center justify-around gap-6 h-14 px-6 bg-gray-800 z-20">
      <Button
        onClick={() => setReset(true)}
        className="z-20 bg-black w-fit min-w-fit h-10 p-1 lg:px-3"
        variant='default'
        color="black"
        title="Reset the canvas"
      >
        <Image src="/undo.png" alt="Reset" className="w-10 h-12" />
        <p className="font-sans text-3xl text-[#574a3a] hidden md:block">Reset</p>
      </Button>
      
      <Button 
        onClick={() => setInsertText(true)}
        className="z-20 bg-black min-w-fit h-10 flex items-center gap-1 p-1 lg:px-3"
        variant='default'
        color="black"
        title="Insert text"
      >
        <Image src="/text.png" alt="Text" className="w-7 h-7" />
        <p className="font-sans text-3xl text-[#d6a426] hidden lg:block">Text</p>
      </Button>

      <Button
        onClick={() => setColor('black')}
        className="z-20 bg-black min-w-fit h-10 flex items-center gap-2 p-1 lg:px-3"
        variant='default'
        color="black"
        title="Eraser"
      >
        <Image src="/eraser.png" alt="Eraser" className="w-8 h-6" />
        <p className="font-sans text-2xl text-[#f6b2c7] hidden lg:block">Eraser</p>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 focus:outline-none">
          <p className="text-white font-sans text-2xl hidden xl:block">Color: </p>
          <div className="relative w-9 h-9 flex items-center justify-center rounded-full border-2 border-white outline outline-2 outline-black">
            <Image src="/pencil.png" alt="Pencil" className="absolute w-7 h-7 z-10" />
            <ColorSwatch
              color={color}
              className="cursor-pointer absolute w-8 h-8"
            />
          </div>
          <ArrowDown className="w-6 h-6 text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900">
          {SWATCHES.map((swatch, index) => (
            <DropdownMenuItem 
              key={index}
              onClick={() => setColor(swatch)} 
              className={`cursor-pointer hover:bg-gray-800 ${color === swatch ? 'bg-gray-700' : ''}`} 
            >
              <ColorSwatch
                key={index}
                color={swatch}
                className="cursor-pointer"
              />

              <DropdownMenuLabel className="text-white">{swatch}</DropdownMenuLabel>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex gap-2 items-center w-[15rem] min-w-[9rem]">
        <p className="text-white font-sans text-2xl hidden xl:block">Width: </p>

        <Slider 
          defaultValue={[strokeWidth]}
          onValueChange={(value) => setStrokeWidth(value[0])}
          min={1}
          max={20} 
          step={1} 
          className="w-[10rem] min-w-[7rem] flex-shrink"
        />

        <p className="text-white font-sans text-2xl">{strokeWidth}</p>
      </div>

      <Button
        onClick={downloadCanvasAsImage}
        className="z-20 bg-black min-w-fit h-10 p-0 lg:px-3"
        variant='default'
        color="black"
        title="Download the canvas as an image"
      >
        <Image src="/download.png" alt="download" className="w-9 h-9" />
        <p className="font-sans text-2xl text-[#b7eb32] hidden xl:block">Download</p>
      </Button>
      
      <Button
        onClick={sendData}
        className="z-20 bg-gray-300 hover:bg-gray-400 w-fit h-10 font-sans flex items-center gap-2"
        variant='default'
        color="black"
        disabled={loading}
      >
        <Image src="/equal.png" alt="Calculate" className="w-8 h-8" />
        <p className="font-sans text-3xl text-black">{loading ? 'Loading...' : 'Calculate'}</p>
      </Button>
    </div>
  )
}
export default TopNavBar