import { useToast } from "vue-toastification";
export function useToast() {
  const toast = useToast();
  const successToast = (message) => {
    toast.success(message);
  };
  const errorToast = (message) => {
    toast.error(message);
  };
  return {
    successToast,
    errorToast,
  };
}
