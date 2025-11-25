import React from 'react';
import { Button, buttonVariants } from './button';
import { cn } from '../../lib/utils';
import { MenuToggleIcon } from './menu-toggle-icon';
import { useScroll } from './use-scroll';
import { createPortal } from 'react-dom';
import { BarChart2 } from 'lucide-react';

interface HeaderProps {
    onLogin: () => void;
    onGetStarted: () => void;
}

export function Header({ onLogin, onGetStarted }: HeaderProps) {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	const links = [
		{
			label: 'Recursos',
			href: '#features',
		},
		{
			label: 'Sobre',
			href: '#about',
		},
	];

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn('sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300', {
				'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg shadow-sm':
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-8">
				<div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
					    <BarChart2 className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">GrinderScore</span>
				</div>
				<div className="hidden items-center gap-6 md:flex">
					{links.map((link) => (
						<a key={link.label} className={cn(buttonVariants({ variant: 'ghost' }), "text-base font-medium text-muted-foreground hover:text-foreground")} href={link.href}>
							{link.label}
						</a>
					))}
					<Button variant="outline" onClick={onLogin} className="font-semibold">Entrar</Button>
					<Button onClick={onGetStarted} className="font-semibold shadow-md">Começar Agora</Button>
				</div>
				<Button
					size="icon"
					variant="outline"
					onClick={() => setOpen(!open)}
					className="md:hidden"
					aria-expanded={open}
					aria-controls="mobile-menu"
					aria-label="Toggle menu"
				>
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>
			<MobileMenu open={open} className="flex flex-col justify-between gap-4 p-6">
				<div className="grid gap-y-4">
					{links.map((link) => (
						<a
							key={link.label}
							className={buttonVariants({
								variant: 'ghost',
								className: 'justify-start text-lg h-12',
							})}
							href={link.href}
                            onClick={() => setOpen(false)}
						>
							{link.label}
						</a>
					))}
				</div>
				<div className="flex flex-col gap-3 mt-auto">
					<Button variant="outline" className="w-full h-12 text-base" onClick={() => { setOpen(false); onLogin(); }}>
						Entrar
					</Button>
					<Button className="w-full h-12 text-base" onClick={() => { setOpen(false); onGetStarted(); }}>
                        Começar Agora
                    </Button>
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open) return null;

	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-background/95 supports-[backdrop-filter]:bg-background/50 backdrop-blur-lg',
				'fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden animate-in fade-in slide-in-from-top-5 duration-200',
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn(
					'size-full',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}