
export interface BreweryDB {
    name: string;
    city: string;
    address_1: string;
    state_province: string;
    state: string;
    country: string;
    phone?: string;
    postal_code: string;
    street?: string;
}

export interface BreweryDbMetadata {
    total: string;
    page: string;
    per_page: string;
}

export interface BreweryList {
    name: string;
    city: string;
    address: string;
    province: string;
    state: string;
    country: string;
    phone?: string;
}

export interface BreweryDetail {
    total: number;
    breweryList: BreweryList[];
}

export interface HeaderRowType {
    label: string;
    id: string;
    align: 'left' | 'right';
    sortable: boolean;
}

