// Contact form endpoint. Set VITE_CONTACT_ENDPOINT at build time to override;
// the committed default is the live Lambda Function URL.
export const CONTACT_ENDPOINT =
  import.meta.env.VITE_CONTACT_ENDPOINT ||
  'https://5i5zivzhafauc3a4mzmiyiz36i0xvmaf.lambda-url.us-west-1.on.aws/';
