import {
  AppProvider as PolarisAppProvider,
  Frame,
  Navigation,
  Page,
} from "@shopify/polaris";
import { HomeIcon, SettingsIcon, ViewIcon } from "@shopify/polaris-icons";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useRouteError,
} from "react-router";
import {
  authenticateAdmin,
  getEmbeddedAppSearch,
} from "../services/shopifyAuth.server.js";

export const loader = async ({ request }) => {
  const { session } = await authenticateAdmin(request);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    appSearch: getEmbeddedAppSearch(request, session.shop),
    shop: session.shop,
  };
};

export const headers = (headersArgs) => boundary.headers(headersArgs);

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export default function AppLayout() {
  const { apiKey, appSearch } = useLoaderData();
  const location = useLocation();
  const navigate = useNavigate();
  const routeSearch = location.search || appSearch || "";

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
                  url: `${item.url}${routeSearch}`,
                  onClick: () => navigate(`${item.url}${routeSearch}`),
                }))}
              />
            </Navigation>
          }
        >
          <Page>
            <Outlet />
          </Page>
        </Frame>
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}
