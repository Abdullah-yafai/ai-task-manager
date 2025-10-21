import Loader from "./Loader";

export default function LoadingButton({ children, loading, className = "", ...rest }) {
  return (
    <button disabled={loading} className={`${className} inline-flex items-center justify-center`} {...rest}>
      {loading ? <Loader size={18} /> : children}
    </button>
  );
}
