import { motion } from "motion/react"

interface ImgAnimationProps {
    src: string,
    width: number,
    height: number,
    cw: boolean,
}

const ImageAnimation = ({src, width, height, cw}: ImgAnimationProps) => {
    const dir = cw ? 1 : -1;
    return (
        <motion.img 
            src={src}
            width={width}
            height={height}
            alt="rotating image"
            animate={{ rotate: 360 * dir }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
    );
}

export default ImageAnimation;