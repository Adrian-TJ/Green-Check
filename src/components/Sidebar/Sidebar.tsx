"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EcoIcon from "@mui/icons-material/Eco";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const navigationItems: NavigationItem[] = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    text: "Medio Ambiente",
    icon: <EcoIcon />,
    path: "/environment",
  },
  {
    text: "Social",
    icon: <PeopleIcon />,
    path: "/social",
  },
  {
    text: "Gobernanza",
    icon: <AccountBalanceIcon />,
    path: "/governance",
  },
];

export default function Sidebar() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <EcoIcon color="primary" />
        <ListItemText
          primary="GreenCheck"
          primaryTypographyProps={{
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "primary.main",
          }}
        />
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "rgba(235, 0, 41, 0.08)",
                    borderLeft: "4px solid",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: "rgba(235, 0, 41, 0.12)",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "primary.main" : "text.primary",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <IconButton
        onClick={toggleDrawer(true)}
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1200,
          backgroundColor: "background.paper",
          boxShadow: 2,
          "&:hover": {
            backgroundColor: "background.paper",
            boxShadow: 4,
          },
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
}
