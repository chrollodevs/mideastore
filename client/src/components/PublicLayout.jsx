import { Link, Outlet, useLocation } from 'react-router-dom';

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Friendly Store Navbar */}
      <header className="retail-nav">
        <div className="container" style={{ 
          paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-24)' 
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            {/* Massively scaled Embedded Logo */}
            <img src="/images/ui/logo.png" alt="El Hamiz Logo" style={{ height: '85px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          
          <nav style={{ display: 'flex', gap: 'var(--space-32)', fontSize: '1rem', fontWeight: '500' }}>
            <Link to="/" style={{ color: location.pathname === '/' ? 'var(--brand-media)' : 'var(--text-primary)' }}>
              Accueil
            </Link>
            <Link to="/products" style={{ color: location.pathname === '/products' ? 'var(--brand-media)' : 'var(--text-primary)' }}>
              Produits
            </Link>
            <a href="/#marques" style={{ color: 'var(--text-primary)' }}>Marques</a>
            <a href="/#contact" style={{ color: 'var(--text-primary)' }}>Contact</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Clean Friendly Footer */}
      <footer style={{ 
        background: '#1F2937', /* Dark but warm slate, overriding surface for footer */
        color: '#FFFFFF',
        paddingTop: 'var(--space-64)', paddingBottom: 'var(--space-48)', 
        marginTop: 'var(--space-64)'
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-48)' }}>
          <div>
            <img src="/images/ui/logo.png" alt="El Hamiz Logo" style={{ height: '40px', filter: 'brightness(0) invert(1)', marginBottom: 'var(--space-16)' }} />
            <p style={{ fontSize: '1rem', color: '#D1D5DB', lineHeight: 1.6 }}>Des produits pour la maison, sélectionnés pour vous par l'équipe El Hamiz. Toujours simple, rapide et fiable.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-16)', color: '#FFFFFF' }}>Navigation</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', fontSize: '1rem', color: '#D1D5DB' }}>
              <li><Link to="/">Accueil du magasin</Link></li>
              <li><Link to="/products">Voir tous nos produits</Link></li>
              <li><a href="/#marques">Nos Marques</a></li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-16)', color: '#FFFFFF' }}>Informations</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', fontSize: '1rem', color: '#D1D5DB' }}>
              <li><a href="/#propos">À propos de nous</a></li>
              <li><a href="/#contact">Nous Contacter</a></li>
              <li><Link to="/admin/login" style={{ color: '#6B7280' }}>Accès Gérant</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
