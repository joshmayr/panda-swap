import Link from 'next/link';

export const Navbar = () => {
    return (
      <>
        <nav className='flex items-center flex-wrap bg-blue-300 p-3 '>
          <Link href='/'>
            <a className='inline-flex items-center p-2 mr-4 '>
              <span className='text-xl text-white font-bold uppercase tracking-wide'>
                PandaSwap
              </span>
            </a>
          </Link>
          <Link href="/mint">
            <a className='inline-flex items-center p-2 mr-4 '>
          <span className='text-xl text-white font-bold uppercase tracking-wide'>
            Mint
          </span>
            </a>
          </Link>
          <Link href="/">
            <a className='inline-flex items-center p-2 mr-4 '>
          <span className='text-xl text-white font-bold uppercase tracking-wide'>
            Trade
          </span>
            </a>
          </Link>
        </nav>
      </>
    );
  };