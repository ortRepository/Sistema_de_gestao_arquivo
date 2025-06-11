interface SliderComponentProps {
  img: string;
}

const SliderComponent = ({ img }: SliderComponentProps) => {
  return (
    <div className="hidden lg:flex relative w-1/2  items-center justify-center overflow-hidden z-10">
      <div
        className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none"
        style={{
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "opacity 0.9s ease-in-out",
        }}
      ></div>
    </div>
  );
};

export default SliderComponent;
