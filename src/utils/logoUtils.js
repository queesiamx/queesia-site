 export const DEFAULT_LOGO_URL = "https://queesia.com/logos/default-logo.png";

 export function getLogoUrl(logoFilename) {
   if (!logoFilename) return DEFAULT_LOGO_URL;

   const filename = String(logoFilename).split("/").pop().trim();

   if (!filename) return DEFAULT_LOGO_URL;

   const hasExtension = /\.(png|jpg|jpeg|webp|svg)$/i.test(filename);

   return `https://queesia.com/logos/${
     hasExtension ? filename : `${filename}.png`
   }`;
 }

 export function handleLogoError(event) {
   event.currentTarget.onerror = null;
   event.currentTarget.src = DEFAULT_LOGO_URL;
 }