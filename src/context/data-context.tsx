
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { convertTimestampsToISO } from '@/lib/utils';
import * as mockData from '@/lib/data';
import type { 
    Project, InventoryItem, PurchaseOrder, Supplier, User, Client, Location, 
    DeliveryNote, InventoryLocation, Notification, PlantillaInstalacion, 
    Replanteo, Technician, Operador, Supervisor, SupplierInvoice, Payment 
} from '@/lib/types';

interface DataContextType {
    loading: boolean;
    projects: Project[];
    inventory: InventoryItem[];
    purchaseOrders: PurchaseOrder[];
    suppliers: Supplier[];
    users: User[];
    clients: Client[];
    locations: Location[];
    deliveryNotes: DeliveryNote[];
    inventoryLocations: InventoryLocation[];
    notifications: Notification[];
    installationTemplates: PlantillaInstalacion[];
    replanteos: Replanteo[];
    technicians: Technician[];
    operadores: Operador[];
    supervisors: Supervisor[];
    supplierInvoices: SupplierInvoice[];
    payments: Payment[];
}

const DataContext = createContext<DataContextType>({
    loading: true,
    projects: [],
    inventory: [],
    purchaseOrders: [],
    suppliers: [],
    users: [],
    clients: [],
    locations: [],
    deliveryNotes: [],
    inventoryLocations: [],
    notifications: [],
    installationTemplates: [],
    replanteos: [],
    technicians: [],
    operadores: [],
    supervisors: [],
    supplierInvoices: [],
    payments: [],
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { isDevMode } = useAuth();
    const [data, setData] = useState<Omit<DataContextType, 'loading'>>({
        projects: [], inventory: [], purchaseOrders: [], suppliers: [], users: [],
        clients: [], locations: [], deliveryNotes: [], inventoryLocations: [],
        notifications: [], installationTemplates: [], replanteos: [], technicians: [],
        operadores: [], supervisors: [], supplierInvoices: [], payments: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isDevMode) {
            setData({
                projects: mockData.projects,
                inventory: mockData.inventory,
                purchaseOrders: mockData.purchaseOrders,
                suppliers: mockData.suppliers,
                users: mockData.users,
                clients: mockData.clients,
                locations: mockData.locations,
                deliveryNotes: mockData.deliveryNotes,
                inventoryLocations: mockData.inventoryLocations,
                notifications: mockData.getNotifications(),
                installationTemplates: mockData.installationTemplates,
                replanteos: mockData.replanteos,
                technicians: mockData.technicians,
                operadores: mockData.operadores,
                supervisors: mockData.supervisors,
                supplierInvoices: mockData.supplierInvoices,
                payments: mockData.payments,
            });
            setLoading(false);
            return;
        }

        const collections: (keyof Omit<DataContextType, 'loading' | 'notifications'>)[] = [
            'projects', 'inventory', 'purchaseOrders', 'suppliers', 'usuarios', 
            'clients', 'locations', 'deliveryNotes', 'inventoryLocations', 
            'installationTemplates', 'replanteos', 'technicians', 'operadores', 
            'supervisores', 'supplierInvoices', 'payments'
        ];
        
        const unsubscribes = collections.map(name => {
            const collectionName = name === 'usuarios' ? 'usuarios' : name;
            return onSnapshot(collection(db, collectionName), 
              (snapshot) => {
                const docs = snapshot.docs.map(doc => {
                    const docData = { id: doc.id, ...doc.data() };
                    if (name === 'purchaseOrders' || name === 'supplierInvoices' || name === 'payments' || name === 'projects') {
                        return convertTimestampsToISO(docData);
                    }
                    return docData;
                });

                setData(prevData => ({
                    ...prevData,
                    [name === 'usuarios' ? 'users' : name]: docs
                }));
                setLoading(false);
              },
              (error) => {
                console.error(`Error fetching ${name}:`, error);
                setLoading(false);
              }
            );
        });

        // Set notifications separately
        setData(prevData => ({
            ...prevData,
            notifications: mockData.getNotifications()
        }));

        return () => unsubscribes.forEach(unsub => unsub());

    }, [isDevMode]);
    
    // Recalculate notifications if dependencies change
    useEffect(() => {
        if (isDevMode) {
            setData(prev => ({
                ...prev,
                notifications: mockData.getNotifications()
            }));
        }
    }, [data.purchaseOrders, data.inventory, data.inventoryLocations, isDevMode]);


    return (
        <DataContext.Provider value={{ ...data, loading }}>
            {children}
        </DataContext.Provider>
    );
};
