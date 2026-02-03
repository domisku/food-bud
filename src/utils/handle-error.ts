import toast from "solid-toast";

export function handleError(error: any) {
  console.log(error);
  toast.error(error.message);
}
