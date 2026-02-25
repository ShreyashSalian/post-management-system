export interface LoginBody {
  userNameOrEmail: string;
  password: string;
}

export interface Userbody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: string;
  userName: string;
}

export interface SearchBody {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  search: string;
}
