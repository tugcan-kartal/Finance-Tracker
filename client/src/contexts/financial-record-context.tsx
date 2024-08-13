import { useUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState } from "react";

interface FinancialRecords{
    id?: string;
    userId: string;
    date: Date;
    description: string;
    amount: number;
    category: string;
    paymentMethod: string;
}

interface FinancialRecordsContextType{
    records: FinancialRecords[];
    addRecord: (record: FinancialRecords)=> void;
    // updateRecord: (id: string,newRecord: FinancialRecord)=>void;
    // deleteRecord: (id: string)=>void;
}

export const FinancialRecordsContext=createContext<FinancialRecordsContextType | undefined>(undefined);

export const FinancialRecordsProvider=({children}: {children: React.ReactNode})=>{

    const [records,setRecords]=useState<FinancialRecords[]>([]);
    const {user}=useUser()
    const fetchRecords = async () => {
        if (!user) return;
        const response = await fetch(`http://localhost:3001/financial-records/getAllByUserId/${user.id}`);
        
        if (response.ok) {
            const records = await response.json();
            console.log(records);
            setRecords(records);
        } else {
            console.error(`Failed to fetch records: ${response.statusText}`);
        }
    };
    

    useEffect(()=>{
        fetchRecords();
    },[user])

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
            console.error("An error occurred:", error);
        }
    };
    

    return <FinancialRecordsContext.Provider value={{records,addRecord}}>
        {children}
    </FinancialRecordsContext.Provider>
}

export const useFinancialRecords=()=>{
    const context=useContext<FinancialRecordsContextType | undefined>(
        FinancialRecordsContext
    );

    if (!context) {
        throw new Error("useFinancialRecords must be used within a FinancialRecordProvider")
    }
    return context;
};