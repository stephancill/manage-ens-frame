import { normalise } from "@ensdomains/ensjs/utils";

export function NameWithAvatar({
  name,
  avatar,
}: {
  name?: string;
  avatar?: string;
}) {
  return (
    <div tw="flex items-center mx-2">
      {avatar && (
        <div tw="flex rounded-full overflow-hidden mr-2 border-gray-200 border bg-gray-200">
          <img className="flex" width={60} height={60} src={avatar} />
        </div>
      )}
      {name && <span className="flex">{normalise(name)}</span>}
    </div>
  );
}
