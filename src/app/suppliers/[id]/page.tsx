
import { SupplierDetailsClient } from "@/components/suppliers/supplier-details-client";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PurchaseOrder, Supplier } from "@/lib/types";
import { convertPurchaseOrderTimestamps } from "@/lib/utils";

async function getSupplierDetails(id: string) {
    const supplierRef = doc(db, "suppliers", id);
    const supplierSnap = await getDoc(supplierRef);

    if (!supplierSnap.exists()) {
        return { supplier: null, purchaseOrders: [] };
    }

    const supplier = { id: supplierSnap.id, ...supplierSnap.data() } as Supplier;

    const poQuery = collection(db, "purchaseOrders");
    const poSnapshot = await getDocs(poQuery);
    
    const allPurchaseOrders = poSnapshot.docs.map(doc => 
        convertPurchaseOrderTimestamps({ id: doc.id, ...doc.data() })
    );

    const supplierPurchaseOrders = allPurchaseOrders.filter(
        po => po.supplier === supplier.name
    );

    return { supplier, purchaseOrders: supplierPurchaseOrders };
}

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
    const { supplier, purchaseOrders } = await getSupplierDetails(params.id);

    if (!supplier) {
        return <div className="p-8">No se encontró el proveedor.</div>;
    }

    return <SupplierDetailsClient supplier={supplier} initialPurchaseOrders={purchaseOrders} />;
}
