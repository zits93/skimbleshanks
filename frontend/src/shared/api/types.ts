export interface Train {
    id: number;
    train_name: string;
    dep_time: string;
    arr_time: string;
    special_seat: string;
    general_seat: string;
}

export interface Target {
    train_name: string;
    seat_type: string;
}

export interface Log {
    time: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

export interface CardInfo {
    number: string;
    password: string;
    birthday: string;
    expire: string;
}
