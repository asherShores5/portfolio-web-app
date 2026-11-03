// Contact form endpoint. Set VITE_CONTACT_ENDPOINT at build time to override;
// the committed default is the live Lambda Function URL.
export const CONTACT_ENDPOINT =
  import.meta.env.VITE_CONTACT_ENDPOINT ||
  'https://veiehrbviocqzirwjbd6h5n4wa0pogdo.lambda-url.us-west-1.on.aws/';
