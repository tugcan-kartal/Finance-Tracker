import { useUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState } from "react";

export interface FinancialRecords {
    _id?: string;
    userId: string;
    date: Date;
    description: string;
    amount: number;
    category: string;
    paymentMethod: string;
}

interface FinancialRecordsContextType {
    records: FinancialRecords[];
    addRecord: (record: FinancialRecords) => void;
    updateRecord: (id: string, newRecord: FinancialRecords) => void;
    deleteRecord: (id: string) => void;
}

export const FinancialRecordsContext = createContext<FinancialRecordsContextType | undefined>(undefined);

export const FinancialRecordsProvider = ({ children }: { children: React.ReactNode }) => {
    const [records, setRecords] = useState<FinancialRecords[]>([]);
    const { user } = useUser();

    const fetchRecords = async () => {
        if (!user) return;

        try {
            const response = await fetch(`http://localhost:3001/financial-records/getAllByUserId/${user.id}`);
            if (response.ok) {
                const records = await response.json();
                console.log(records);
                setRecords(records);
            } else {
                console.error(`Failed to fetch records: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [user]);

    const addRecord = async (record: FinancialRecords) => {
        try {
            const response = await fetch("http://localhost:3001/financial-records", {
                method: "POST",
                body: JSON.stringify(record),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const newRecord = await response.json();
                setRecords((prev) => [...prev, newRecord]);
            } else {
                console.error(`Failed to add record: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error adding record:', error);
        }
    };

    const updateRecord = async (id: string, newRecord: FinancialRecords) => {
        try {
            const response = await fetch(`http://localhost:3001/financial-records/${id}`, {
                method: "PUT",
                body: JSON.stringify(newRecord),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const updatedRecord = await response.json();
                setRecords((prev) =>
                    prev.map((record) => (record._id === id ? updatedRecord : record))
                );
            } else {
                console.error(`Failed to update record: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    const deleteRecord = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3001/financial-records/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setRecords((prev) => prev.filter((record) => record._id !== id));
            } else {
                console.error(`Failed to delete record: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    return (
        <FinancialRecordsContext.Provider value={{ records, addRecord, updateRecord, deleteRecord }}>
            {children}
        </FinancialRecordsContext.Provider>
    );
};

export const useFinancialRecords = () => {
    const context = useContext(FinancialRecordsContext);
    if (!context) {
        throw new Error("useFinancialRecords must be used within a FinancialRecordsProvider");
    }
    return context;
};
