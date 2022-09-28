import Head from "next/head";

export const HeadDetails = () => {
  return (
    <Head>
      <title>Solidity Next.js Starter</title>
      <meta
        name='description'
        content='Interact with a simple smart contract from the client-side.'
      />
      <link rel='icon' href='/favicon.ico' />
    </Head>
  );
};