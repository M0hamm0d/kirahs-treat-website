import { useToast } from "vue-toastification";
export function useToastComposable() {
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
