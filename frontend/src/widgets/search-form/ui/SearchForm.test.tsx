import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchForm } from './SearchForm';
import { useRailStore } from '../../../features/reservation/model/railStore';
import { useAuthStore } from '../../../features/auth/model/authStore';

vi.mock('../../../features/reservation/model/railStore', () => ({
    useRailStore: vi.fn()
}));

vi.mock('../../../features/auth/model/authStore', () => ({
    useAuthStore: vi.fn()
}));

describe('SearchForm', () => {
    const mockSetSearchField = vi.fn();
    const mockDoSearch = vi.fn();
    const stations = ['수서', '부산'];

    it('should render form with initial values', () => {
        (useRailStore as any).mockReturnValue({
            dep: '수서',
            arr: '부산',
            date: '20260429',
            time: '090000',
            adults: 1,
            children: 0,
            seniors: 0,
            dis1to3: 0,
            dis4to6: 0,
            setSearchField: mockSetSearchField,
            doSearch: mockDoSearch
        });
        (useAuthStore as any).mockReturnValue({ loading: false });

        render(<SearchForm stations={stations} />);
        
        expect(screen.getByLabelText('출발역')).toBeDefined();
        expect(screen.getByDisplayValue('수서')).toBeDefined();
    });

    it('should call setSearchField when changing stations', () => {
        render(<SearchForm stations={stations} />);
        
        const depSelect = screen.getByLabelText('출발역');
        fireEvent.change(depSelect, { target: { value: '부산' } });
        
        expect(mockSetSearchField).toHaveBeenCalledWith('dep', '부산');
    });

    it('should swap stations when clicking swap button', () => {
        render(<SearchForm stations={stations} />);
        
        const swapBtn = screen.getByTitle('출발/도착역 전환');
        fireEvent.click(swapBtn);
        
        expect(mockSetSearchField).toHaveBeenCalledWith('dep', '부산');
        expect(mockSetSearchField).toHaveBeenCalledWith('arr', '수서');
    });

    it('should call doSearch when clicking search button', () => {
        render(<SearchForm stations={stations} />);
        
        const searchBtn = screen.getByText('열차 조회');
        fireEvent.click(searchBtn);
        
        expect(mockDoSearch).toHaveBeenCalled();
    });
});
