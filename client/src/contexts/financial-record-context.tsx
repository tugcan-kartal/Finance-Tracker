import { useUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState } from "react";

export interface FinancialRecords{
    _id?: string;
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
    updateRecord: (id: string,newRecord: FinancialRecords)=>void;
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
        const response = await fetch("http://localhost:3001/financial-records", {
            method: "POST",
            body: JSON.stringify(record),
            headers: {
                "Content-Type": "application/json",
            },
        });
    
        try {
            if (response.ok) {
                const newRecord = await response.json();
                setRecords((prev) => [...prev, newRecord]);
            } else {
                console.error(`Failed to add record: ${response.statusText}`);
            }
        } catch (error) {
        }
    };

    const updateRecord = async (id:string,newRecord: FinancialRecords) => {
        const response = await fetch(`http://localhost:3001/financial-records/${id}`, {
            method: "PUT",
            body: JSON.stringify(newRecord),
            headers: {
                "Content-Type": "application/json",
            },
        });
    
        try {
            if (response.ok) {
                const newRecord = await response.json();
                setRecords((prev)=>prev.map((record)=>{
                    if(record._id===id){
                        return newRecord;
                    }else{
                        return record;
                    }
                }))
            } else {
                console.error(`Failed to add record: ${response.statusText}`);
            }
        } catch (error) {
        }
    };
    

    return <FinancialRecordsContext.Provider value={{records,addRecord,updateRecord}}>
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