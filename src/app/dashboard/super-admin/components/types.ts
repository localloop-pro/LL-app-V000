export interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'resolved' | 'pending';
  createdAt: string;
  description: string;
  type: string;
}

export interface Merchant {
  id: string;
  name: string;
  logo: string;
  merchantId: string; // e.g., #BND-8821
  status: 'live' | 'pending' | 'suspended';
  activeDeals: number | null;
  essayStatus: 'published' | 'drafting' | 'none';
  address: string;
  coordinates: [number, number]; // [lng, lat]
  totalSales: number;
  rating: number;
  tickets: Ticket[];
  supportTickets?: {
    count: number;
    ticketId?: string;
    type?: string;
  };
}

export interface GeoLocation {
  id: string;
  name: string;
  type: 'country' | 'state' | 'city' | 'postcode';
  children?: GeoLocation[];
  coordinates?: [number, number];
}

export interface Stats {
  activeMerchants: number;
  pendingApproval: number;
  openTickets: number;
}

export const mockGeoHierarchy: GeoLocation[] = [
  {
    id: 'australia',
    name: 'Australia',
    type: 'country',
    children: [
      {
        id: 'nsw',
        name: 'NSW',
        type: 'state',
        children: [
          {
            id: 'sydney',
            name: 'Sydney',
            type: 'city',
            children: [
              {
                id: 'bondi-2026',
                name: 'Bondi (2026)',
                type: 'postcode',
                coordinates: [151.2767, -33.8915],
              },
              {
                id: 'bronte-2024',
                name: 'Bronte (2024)',
                type: 'postcode',
                coordinates: [151.2633, -33.9067],
              },
              {
                id: 'coogee-2034',
                name: 'Coogee (2034)',
                type: 'postcode',
                coordinates: [151.2556, -33.9233],
              },
            ],
          },
        ],
      },
      {
        id: 'victoria',
        name: 'Victoria',
        type: 'state',
        children: [],
      },
    ],
  },
];

export const mockMerchants: Merchant[] = [
  {
    id: 'bondi-burger',
    name: 'Bondi Burger Joint',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1GTUsa6A2pfE_gqVWhjfaL3rl6BupUkYmKfZKGZpUvdwBNEPaWWDeEHohBI-NoN_6UOIT8s03cNDVYAOzP1VCKu8i6lCvcTNLnLHQfBY-S39R5hZKCY5yU5GADZKdDi4tU2ce60qLsbYFiC6enyxv8iiy0J6sk4uvqETtm3lK1Ojsvm3WumV-WAuxlKvbasrPkZezGRrjN4MoEsRD43JAm2V-6Rxsf5HGryegB9l_jfO0tjVeI1sbboumGj2BEU3LeWD-GybzcJs',
    merchantId: '#BND-8821',
    status: 'live',
    activeDeals: 3,
    essayStatus: 'published',
    address: '80 Campbell Parade, Bondi Beach NSW 2026',
    coordinates: [151.2767, -33.8915],
    totalSales: 12450,
    rating: 4.8,
    tickets: [
      {
        id: '402',
        title: 'Content Issue',
        status: 'open',
        createdAt: '2h ago',
        description:
          "Merchant is unable to upload the essay for 'Best Burgers in Bondi'. System throws error 505.",
        type: 'Content Issue',
      },
    ],
    supportTickets: {
      count: 1,
      ticketId: '#402',
      type: 'Ticket',
    },
  },
  {
    id: 'surf-shop',
    name: 'Surf Shop Co.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNkUPwrsjyUiwmzsN3Org9eZZjdPC0Tg0aAYf0EZ57JqqS_hFD2wcRSpO38ajHrzJguSulLRDDLjgdLF3_lI4nv_f9gqis12zuwkM2fU9If5zTeZm37MKoxCvGGxpbcuM9mFUuZo6HpqD-5Jl8phKVC9SGzWmuw9wq1_D4iElhEb92YlPlXBvDsz4nLcl1UcXUmejx9B_UzkNfjudSdZsPpfuIWWLZOi8UzvJ4N3UADJKEJOLP6b7N9L6_wAHNhzFZTN4Mv4DZ_oM',
    merchantId: '#BND-9012',
    status: 'suspended',
    activeDeals: 0,
    essayStatus: 'none',
    address: '120 Campbell Parade, Bondi Beach NSW 2026',
    coordinates: [151.2745, -33.8895],
    totalSales: 0,
    rating: 0,
    tickets: [],
  },
  {
    id: 'green-cafe',
    name: 'The Green Cafe',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ4XxHpH7aY9eD6UN0dj4CGfNWEVOL29WgwVklFFoH50OGfUE_xxOU_btJhvtjwp-FKrmMmbIcqfsWxVOgnunEIswpykDn5GoDxQOizuHcN3BUOEZZAVsQlXVcuuXNKRgl-2xTwsfDlKoAcWMgoYY-np7qrndjBGq9kQBYrCsPH39iTJO4frjThmaLh7K66PcmLGsoNJti2ZsELqpdPteDmNmjvVbAIfgrj61LR5xEABWYI7TdtSKoX7xcw1SFMUW1Ytqoj8KHefc',
    merchantId: '#BND-1142',
    status: 'pending',
    activeDeals: null,
    essayStatus: 'drafting',
    address: '45 Hall Street, Bondi Beach NSW 2026',
    coordinates: [151.2789, -33.8933],
    totalSales: 0,
    rating: 0,
    tickets: [],
    supportTickets: {
      count: 2,
      type: 'Onboarding',
    },
  },
  {
    id: 'ocean-view',
    name: 'Ocean View Hotel',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbgQFKyi1L9vjboTwLGkuYDV6vL6jDFOdcVZnQoFgviy8VoA4RQNoCljH-P5cxh1FE_lUHS2Gs4-RvOiWDe8hG23BigVPQ3-rSZNO8okyn7LIeFxPVnV0QRnpTU1bSIjixXZu9pHGyVKiWtxn5-LXlYbGselLOK2UWUg4SqJSw49TjiAM66gfpQmm61B-bbsgR4NZiFQ45Rc7Y7BGfoJHN_kkit7wgZXjOv3W-pdwrOE3gA8NsIN3emNVWJLlZFuvB6QfArJHJXEk',
    merchantId: '#BND-3391',
    status: 'live',
    activeDeals: 1,
    essayStatus: 'published',
    address: '180 Campbell Parade, Bondi Beach NSW 2026',
    coordinates: [151.2795, -33.8955],
    totalSales: 8500,
    rating: 4.5,
    tickets: [],
  },
];

export const mockStats: Stats = {
  activeMerchants: 142,
  pendingApproval: 3,
  openTickets: 5,
};

