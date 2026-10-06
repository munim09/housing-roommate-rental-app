const FOOTER_SECTIONS = [
    {
        title: "Renters",
        links: [
            //   { href: "/listings", label: "Browse listings" },
            { href: "/#how-it-works", label: "How it works" },
            { href: "/#faq", label: "Renting FAQ" },
            { href: "/register", label: "Create account" },
        ],
    },
    {
        title: "Owners",
        links: [
            { href: "/register", label: "List a property" },
            { href: "/owner/dashboard", label: "Owner dashboard" },
            { href: "/manager/dashboard", label: "For managers" },
            { href: "/owner/reports", label: "Portfolio reports" },
        ],
    },
    {
        title: "Company",
        links: [
            { href: "/contact", label: "Contact us" },
            { href: "/#safety", label: "Safety" },
            { href: "/terms", label: "Privacy & terms" },
            { href: "/payments/status", label: "Payment status" },
        ],
    },
] as const;

export function SiteFooter() {
    return (
        <></>
        // <footer className="mt-auto border-t bg-muted/40">
        //     <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        //         <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        //             <div className="grid content-start gap-3">
        //                 <Link href="/" className="flex items-center gap-2">
        //                     <BrandMark />
        //                     <span className="text-sm font-semibold tracking-tight">
        //                         Dwellio
        //                     </span>
        //                 </Link>
        //                 <p className="max-w-xs text-sm text-muted-foreground">
        //                     The housing and roommate platform for verified
        //                     listings, viewings, agreements and rent.
        //                 </p>
        //             </div>

        //             {FOOTER_SECTIONS.map((section) => (
        //                 <div key={section.title}>
        //                     <h2 className="text-sm font-semibold">
        //                         {section.title}
        //                     </h2>
        //                     <ul className="mt-3 grid gap-1">
        //                         {section.links.map((link) => (
        //                             <li key={`${section.title}-${link.href}`}>
        //                                 <Link
        //                                     href={link.href}
        //                                     className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        //                                 >
        //                                     {link.label}
        //                                 </Link>
        //                             </li>
        //                         ))}
        //                     </ul>
        //                 </div>
        //             ))}
        //         </div>

        //         <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
        //             <p className="text-sm text-muted-foreground">
        //                 © {new Date().getFullYear()} Dwellio. All rights
        //                 reserved.
        //             </p>
        //             <p className="text-sm text-muted-foreground">
        //                 Payments secured by SSLCommerz
        //             </p>
        //         </div>
        //     </div>
        // </footer>
    );
}
