
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { convertTimestampsToISO, convertPurchaseOrderTimestamps } from '@/lib/utils';
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
    const { isDevMode, loading: authLoading } = useAuth();
    const [data, setData] = useState<Omit<DataContextType, 'loading'>>({
        projects: [], inventory: [], purchaseOrders: [], suppliers: [], users: [],
        clients: [], locations: [], deliveryNotes: [], inventoryLocations: [],
        notifications: [], installationTemplates: [], replanteos: [], technicians: [],
        operadores: [], supervisors: [], supplierInvoices: [], payments: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) {
            // Wait for auth to be ready before deciding data source
            return;
        }

        if (isDevMode) {
            setData({
                projects: mockData.projects,
                inventory: mockData.inventory,
                purchaseOrders: mockData.purchaseOrders.map(convertPurchaseOrderTimestamps),
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
                supplierInvoices: mockData.supplierInvoices.map(convertTimestampsToISO),
                payments: mockData.payments.map(convertTimestampsToISO),
            });
            setLoading(false);
            return () => {}; // No-op cleanup
        }

        const collections: { name: keyof Omit<DataContextType, 'loading' | 'notifications'>; firestoreName: string }[] = [
            { name: 'projects', firestoreName: 'projects' },
            { name: 'inventory', firestoreName: 'inventory' },
            { name: 'purchaseOrders', firestoreName: 'purchaseOrders' },
            { name: 'suppliers', firestoreName: 'suppliers' },
            { name: 'users', firestoreName: 'usuarios' },
            { name: 'clients', firestoreName: 'clients' },
            { name: 'locations', firestoreName: 'locations' },
            { name: 'deliveryNotes', firestoreName: 'deliveryNotes' },
            { name: 'inventoryLocations', firestoreName: 'inventoryLocations' },
            { name: 'installationTemplates', firestoreName: 'installationTemplates' },
            { name: 'replanteos', firestoreName: 'replanteos' },
            { name: 'technicians', firestoreName: 'technicians' },
            { name: 'operadores', firestoreName: 'operadores' },
            { name: 'supervisors', firestoreName: 'supervisores' },
            { name: 'supplierInvoices', firestoreName: 'supplierInvoices' },
            { name: 'payments', firestoreName: 'payments' }
        ];
        
        const unsubscribes = collections.map(col => {
            return onSnapshot(collection(db, col.firestoreName), 
              (snapshot) => {
                const docs = snapshot.docs.map(doc => {
                    const docData = { id: doc.id, ...doc.data() };
                    // Apply timestamp conversion for specific collections
                    if (['purchaseOrders', 'supplierInvoices', 'payments', 'projects'].includes(col.name)) {
                        return convertTimestampsToISO(docData);
                    }
                    return docData;
                });

                setData(prevData => ({
                    ...prevData,
                    [col.name]: docs
                }));
                setLoading(false);
              },
              (error) => {
                console.error(`Error fetching ${col.name}:`, error);
                setLoading(false);
              }
            );
        });

        // Set notifications separately as they are derived data
        setData(prevData => ({
            ...prevData,
            notifications: mockData.getNotifications()
        }));

        return () => unsubscribes.forEach(unsub => unsub());

    }, [isDevMode, authLoading]);
    
    // Recalculate derived notifications if dependencies change
    useEffect(() => {
        setData(prev => ({
            ...prev,
            notifications: mockData.getNotifications()
        }));
    }, [data.purchaseOrders, data.inventory, data.inventoryLocations]);


    return (
        <DataContext.Provider value={{ ...data, loading }}>
            {children}
        </DataContext.Provider>
    );
};
