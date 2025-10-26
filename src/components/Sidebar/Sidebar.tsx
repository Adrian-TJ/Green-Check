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
import Collapse from "@mui/material/Collapse";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NatureIcon from "@mui/icons-material/Nature";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ReceiptIcon from "@mui/icons-material/Receipt";
import GroupsIcon from "@mui/icons-material/Groups";
import GavelIcon from "@mui/icons-material/Gavel";

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    text: "Medio Ambiente",
    icon: <NatureIcon />,
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
  {
    text: "Registro",
    icon: <AddCircleIcon />,
    children: [
      {
        text: "Recibos",
        icon: <ReceiptIcon />,
        path: "/resourceRegister",
      },
      {
        text: "Social",
        icon: <GroupsIcon />,
        path: "/socialRegister",
      },
      {
        text: "Gobernanza",
        icon: <GavelIcon />,
        path: "/governanceRegister",
      },
    ],
  },
];

export default function Sidebar() {
  const [open, setOpen] = React.useState(false);
  const [registroOpen, setRegistroOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const handleRegistroClick = () => {
    setRegistroOpen(!registroOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <NatureIcon color="primary" />
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
          if (item.children) {
            // Dropdown menu item
            const hasActiveChild = item.children.some(
              (child) => child.path && pathname === child.path
            );
            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleRegistroClick}
                    selected={hasActiveChild}
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
                        color: hasActiveChild
                          ? "primary.main"
                          : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: hasActiveChild ? 600 : 400,
                        color: hasActiveChild ? "primary.main" : "text.primary",
                      }}
                    />
                    {registroOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={registroOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => {
                      const isActive = pathname === child.path;
                      return (
                        <ListItem key={child.text} disablePadding>
                          <ListItemButton
                            onClick={() => {
                              if (child.path) {
                                handleNavigation(child.path);
                              }
                            }}
                            selected={isActive}
                            sx={{
                              pl: 4,
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
                                color: isActive
                                  ? "primary.main"
                                  : "text.secondary",
                                minWidth: 40,
                              }}
                            >
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.text}
                              primaryTypographyProps={{
                                fontWeight: isActive ? 600 : 400,
                                color: isActive
                                  ? "primary.main"
                                  : "text.primary",
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          } else {
            // Regular menu item
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.path) {
                      handleNavigation(item.path);
                    }
                  }}
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
          }
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
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 30,
            borderBottomRightRadius: 30,
            boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
          },
        }}
      >
        {DrawerList}
      </Drawer>
    </>
  );
}
