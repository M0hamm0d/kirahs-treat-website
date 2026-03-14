import { supabase } from "@/supabase";
export const useEvent = () => {
  const uploadFile = async (file, currentFileName) => {
    try {
      if (currentFileName) {
        const { error: deleteError } = await supabase.storage
          .from("product-image")
          .remove([currentFileName]);
        if (deleteError) {
          console.warn("Failed to delete old image:", deleteError.message);
        }
      }

      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-image")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData, error: urlError } = supabase.storage
        .from("product-image")
        .getPublicUrl(fileName);
      if (urlError) throw urlError;

      return {
        success: true,
        fileName,
        url: publicUrlData.publicUrl,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "File upload failed",
      };
    }
  };
  return { uploadFile };
};
