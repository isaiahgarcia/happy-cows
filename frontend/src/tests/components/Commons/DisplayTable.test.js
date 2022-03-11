import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import AdminCommonsTablePage from "main/pages/AdminCommonsTablePage";
import DisplayTable from "main/components/Commons/DisplayTable";
import commonsFixtures from "fixtures/commonsFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

import { fireEvent } from "@testing-library/react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});;

describe("AdminCommonsTable tests", () => {
    const queryClient = new QueryClient();
    const axiosMock = new AxiosMockAdapter(axios);
    const testId = "DisplayTable";

   

    const setupAdminUser = () => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    };

    test("renders without crashing for empty table for admin", () => {
        const currentUser = currentUserFixtures.adminUser;

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <DisplayTable commons={[]} currentUser={currentUser} />
                </MemoryRouter>
            </QueryClientProvider>

        );
    });

    test("Has the expected colum headers and content for adminUser", () => {

        const currentUser = currentUserFixtures.adminUser;

        const { getByText, getByTestId } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <DisplayTable commons={commonsFixtures.threeCommons} currentUser={currentUser} />
                </MemoryRouter>
            </QueryClientProvider>

        );

        const expectedHeaders = ["ID#", "Name", "Starting Balance", "Cow Price", "Milk Price", "Start Date"];
        const expectedFields = ["id", "name", "startingBalance", "cowPrice", "milkPrice", "startingDate"];
        const testId = "DisplayTable";

        expectedHeaders.forEach((headerText) => {
            const header = getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach((field) => {
            const header = getByTestId(`${testId}-cell-row-0-col-${field}`);
            expect(header).toBeInTheDocument();
        });

        expect(getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("5");
        expect(getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("4");

        const deleteButton = getByTestId(`${testId}-cell-row-0-col-Delete-button`);
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toHaveClass("btn-danger");

    });

    test("test what happens when you click delete, admin", async () => {
        setupAdminUser();

        const queryClient = new QueryClient();
        axiosMock.onGet("/api/commons/all").reply(200, commonsFixtures.oneCommons);
        axiosMock.onDelete("/api/commons/delete").reply(200, "record 1 deleted");


        const { getByTestId } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminCommonsTablePage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => { expect(getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument(); });

        expect(getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1"); 


        const deleteButton = getByTestId(`${testId}-cell-row-0-col-Delete-button`);
        expect(deleteButton).toBeInTheDocument();
       
        fireEvent.click(deleteButton);

        await waitFor(() =>  expect(mockToast).toBeCalled);
        expect(mockToast).toBeCalledWith("record 1 deleted");
       

    });
});