export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  iconName: 'LayoutDashboard' | 'Wrench' | 'ImageIcon' | 'Users' | 'Settings' | 'Building2';
  enabled: boolean;
  roles?: string[];
}

export interface AdminAppConfig {
  appName: string;
  appSubtitle: string;
  logoIcon: 'Building2' | 'Wrench' | 'Boxes';
  navigation: NavigationItem[];
}

export const adminConfig: AdminAppConfig = {
  appName: 'Admin Console',
  appSubtitle: 'Rugerios Roofing & Co.',
  logoIcon: 'Building2',
  navigation: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/dashboard',
      iconName: 'LayoutDashboard',
      enabled: true,
    },
    {
      id: 'services',
      name: 'Servicios',
      href: '/dashboard/services',
      iconName: 'Wrench',
      enabled: true,
    },
    {
      id: 'portfolio',
      name: 'Portafolio',
      href: '/dashboard/portfolio',
      iconName: 'ImageIcon',
      enabled: true,
    },
    {
      id: 'users',
      name: 'Usuarios',
      href: '/dashboard/users',
      iconName: 'Users',
      enabled: false, // Deshabilitado por defecto para demostrar configuración dinámica
    },
    {
      id: 'settings',
      name: 'Configuración',
      href: '/dashboard/settings',
      iconName: 'Settings',
      enabled: false, // Deshabilitado por defecto
    },
  ],
};
