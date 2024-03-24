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
        <div tw="flex rounded-full overflow-hidden mr-2">
          <img width={60} height={60} src={avatar} />
        </div>
      )}
      {name}
    </div>
  );
}
