export default function Loader({ size = 40 }) {
  return (
    <div className="flex items-center justify-center">
      <div
        style={{ width: size, height: size }}
        className="border-4 border-t-transparent border-white/20 rounded-full animate-spin"
      />
    </div>
  );
}
