import {
    Icon,
    TableCell,
    TableHead,
    TableBody,
    TableRow,
    Table,
    TextField, InputAdornment, IconButton, Pagination, Select, MenuItem, TableSortLabel
} from '@mui/material';
import {useEffect, useState} from "react";
import {BreweryDB, BreweryDbMetadata, BreweryDetail, HeaderRowType} from "../common/types";
import {useApiFetch} from "../hooks/useFetch";

import './RestaurantList.css';


const mapBreweryDbToRow = (breweries: BreweryDB[], total?: string): BreweryDetail => ({
    total: total !== undefined ? Number.parseInt(total) : breweries.length,
    breweryList: breweries.map(brewery => ({
        name: brewery.name,
        city: brewery.city,
        state: brewery.state,
        province: brewery.state_province,
        country: brewery.country,
        address: brewery.street + ', ' + brewery.address_1 + ', ' + brewery.state_province + ', ' + brewery.state + ', ' + brewery.postal_code,
        phone: brewery.phone,
    }))
});

const getBreweryUrls = (
    currentPage: number,
    rowPerPage: number,
    sortColumn: string,
    sortOrder: string,
    searchText?: string
) => {
    const baseUrl = 'https://api.openbrewerydb.org/v1/breweries';
    const paginationParams = `page=${currentPage}&per_page=${rowPerPage}`;
    const sortParams = `sort=${sortColumn}:${sortOrder}`;
    const searchParams = searchText ? `by_name=${searchText}` : undefined;
    const metaUrl = `${baseUrl}/meta${searchParams ? `?${searchParams}` : ''}`;
    const listUrl = `${baseUrl}?${paginationParams}&${sortParams}${searchParams ? `&${searchParams}` : ''}`;

    return {metaUrl, listUrl};
}

const headerRows: HeaderRowType[] = [
    {label: '#Serial', id: 'serial', sortable: false, align: 'left'},
    {label: 'Name', id: 'name', sortable: true, align: 'left'},
    {label: 'City', id: 'city', sortable: true, align: 'right'},
    {label: 'State', id: 'state', sortable: false, align: 'right'},
    {label: 'Country', id: 'country', sortable: true, align: 'right'},
    {label: 'Address', id: 'address', sortable: false, align: 'right'},
];

const RestaurantListHeader = (props: {
    sortColumn: string;
    sortOrder: 'asc' | 'desc';
    onClickColumn: (columnId: string) => void;
}) => {
    const {sortColumn, sortOrder, onClickColumn} = props;
    return (
        <>
            {headerRows.map(headerRow => (
                <TableCell align={headerRow.align}>
                    {headerRow.sortable
                        ? (<TableSortLabel
                            active={sortColumn === headerRow.id}
                            direction={sortColumn === headerRow.id ? sortOrder : 'asc'}
                            onClick={() => onClickColumn(headerRow.id)}
                        >
                            {headerRow.id !== sortColumn && <Icon className="header-icon">sort</Icon>}
                            {headerRow.label}
                        </TableSortLabel>)
                        : headerRow.label
                    }
                </TableCell>
            ))}
        </>
    )
};

const RestaurantListPagination = (props: {
    rowPerPage: number;
    onChangeRowPerPage: (s: number) => void;
    currentPage: number;
    onChangeCurrentPage: (s: number) => void;
    pageCount: number;
}) => {
    const {rowPerPage, onChangeRowPerPage, currentPage, onChangeCurrentPage, pageCount} = props;
    return (
        <div className="restaurant-list-pagination">
            <div className="restaurant-list-pagination-row-perpage">
                <div className="label">Rows per page</div>
                <Select
                    size="small"
                    className="select"
                    value={rowPerPage}
                    onChange={(e) => onChangeRowPerPage(Number(e.target.value))}
                >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                </Select>
            </div>
            <Pagination
                count={pageCount}
                page={currentPage}
                size="medium"
                onChange={(_e, value) => onChangeCurrentPage(value)}/>
        </div>
    );
};

export const RestaurantList = () => {
    const [visibleRows, setVisibleRows] = useState<BreweryDetail>();

    const [searchText, setSearchText] = useState<string>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowPerPage, setRowPerPage] = useState<number>(5);
    const [sortColumn, setSortColumn] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const {listUrl, metaUrl} = getBreweryUrls(currentPage, rowPerPage, sortColumn, sortOrder, searchText);

    const {data: listData = []} = useApiFetch<BreweryDB[]>(listUrl);
    const {data: metaData} = useApiFetch<BreweryDbMetadata>(metaUrl);

    useEffect(() => {
        const visibleData = mapBreweryDbToRow(listData, metaData?.total);
        setVisibleRows(visibleData);
    }, [listData, metaData]);

    const pageCount = Math.ceil((visibleRows?.total || 0) / rowPerPage);

    return (
        <div className="restaurant-list-container">
            <div className="restaurant-list-search-field">
                <TextField
                    value={searchText}
                    type="search"
                    size="small"
                    placeholder="Search.."
                    onChange={e => {
                        setCurrentPage(1);
                        setSearchText(e.target.value !== "" ? e.target.value : undefined);
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton>
                                    <Icon>search</Icon>
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </div>
            <div className="restaurant-list-table">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <RestaurantListHeader
                                sortColumn={sortColumn}
                                sortOrder={sortOrder}
                                onClickColumn={headerId => {
                                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                    setSortColumn(headerId);
                                }}
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visibleRows?.breweryList.map((visibleRow, i) => (
                            <TableRow>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{visibleRow.name}</TableCell>
                                <TableCell align="right">{visibleRow.city}</TableCell>
                                <TableCell align="right">{visibleRow.state}</TableCell>
                                <TableCell align="right">{visibleRow.country}</TableCell>
                                <TableCell align="right">{visibleRow.address}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <RestaurantListPagination
                rowPerPage={rowPerPage}
                onChangeRowPerPage={value => setRowPerPage(value)}
                currentPage={currentPage}
                onChangeCurrentPage={value => setCurrentPage(value)}
                pageCount={pageCount}/>
        </div>
    );
};