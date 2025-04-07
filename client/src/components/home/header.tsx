import '@/styles/header.css';
import Link from 'next/link';

const Header = () => {
    return (
        <header className="header">
            <Link href="/">
                <img 
                    src="/logo/logo.png" 
                    alt="logo" 
                    className="logo"
                />
            </Link>
        </header>
    );
};

export default Header;
