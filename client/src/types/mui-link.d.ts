import { Link } from 'wouter';
import { ListItemButtonProps } from '@mui/material';

declare module '@mui/material/ListItemButton' {
  interface ListItemButtonProps {
    component?: React.ComponentType<any>;
    href?: string;
  }
}