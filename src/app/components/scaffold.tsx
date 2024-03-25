export function Scaffold({ children: element }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex", // Use flex layout
        flexDirection: "row", // Align items horizontally
        alignItems: "stretch", // Stretch items to fill the container height
        width: "100%",
        height: "100vh", // Full viewport height
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          lineHeight: 1.2,
          fontSize: 36,
          color: "black",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {element}
      </div>
    </div>
    // <div tw="flex flex-row items-stretch w-full h-full bg-white">
    //   <div tw="flex flex-col justify-center items-center leading-tight text-black overflow-hidden">
    //     {children}
    //   </div>
    // </div>
  );
}
