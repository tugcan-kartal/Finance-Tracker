import { Children, createContext, useContext, useState } from "react";

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

    const addRecord=async(record: FinancialRecords)=>{
        const response=await fetch("http//localhost:3001/financial-records",{method: "POST",body: JSON.stringify(record)});

        try {
            if (response.ok) {
                const newRecord=await response.json();
                setRecords((prev)=>[...prev,newRecord]);
            }
        } catch (error) {
            
        }
        
    }
    return <FinancialRecordsContext.Provider value={{records,addRecord}}>
        {""}
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