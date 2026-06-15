import {
  AppProvider as PolarisAppProvider,
  Frame,
  Navigation,
  Page,
} from "@shopify/polaris";
import { HomeIcon, SettingsIcon, ViewIcon } from "@shopify/polaris-icons";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import { NavLink, Outlet, useLoaderData, useLocation } from "react-router";
import { authenticateAdmin } from "../services/shopifyAuth.server.js";

export const loader = async ({ request }) => {
  await authenticateAdmin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function AppLayout() {
  const { apiKey } = useLoaderData();
  const location = useLocation();

  const navigationItems = [
    { label: "Dashboard", url: "/app", icon: HomeIcon },
    { label: "Settings", url: "/app/settings", icon: SettingsIcon },
    { label: "Preview", url: "/app/preview", icon: ViewIcon },
  ];

  return (
    <ShopifyAppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={{}}>
        <Frame
          navigation={
            <Navigation location={location.pathname}>
              <Navigation.Section
                items={navigationItems.map((item) => ({
                  ...item,
                  selected: location.pathname === item.url,
                  url: item.url,
                }))}
              />
            </Navigation>
          }
        >
          <Page>
            <div className="geoflow-admin-links">
              {navigationItems.map((item) => (
                <NavLink key={item.url} to={item.url}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <Outlet />
          </Page>
        </Frame>
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}
