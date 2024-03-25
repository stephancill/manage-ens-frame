import { Heading } from "../components/heading";
import { Scaffold } from "../components/scaffold";
import { deserializeJsx, renderImage, serializeJsx } from "../renderImage";
import { imageUrl } from "../utils";

export default async function Page() {
  // const element = <div>Hello</div>;
  const element = (
    <Scaffold>
      <div tw="flex flex-col">
        <Heading>ENS Tools</Heading>
        <div tw="flex">Manage your ENS names</div>
      </div>
    </Scaffold>
  );
  let elementRendered: string | null = null;

  try {
    elementRendered = await renderImage(element);
  } catch (error) {
    if (process.env.NODE_ENV === "development") throw error;
  }

  const serialized = serializeJsx(element);
  const deserialized = deserializeJsx(serialized);
  const deserializedRendered = imageUrl(deserialized);

  // console.log(JSON.stringify(serialized, null, 2));

  const size = 200;
  const block = `w-[${size}px] h-[${size}px] border-2 border-white`;

  return (
    <div className="w-1/2 h-full">
      <div className="flex gap-10">
        {elementRendered && (
          <div>
            <img src={elementRendered} className={block}></img>
          </div>
        )}
        <div>
          <img src={deserializedRendered} className={block}></img>
        </div>
      </div>
    </div>
  );
}
