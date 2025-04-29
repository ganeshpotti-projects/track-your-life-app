// THIRD PARTY
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/config/firebase";

// SERVICES
import { createOrUpdateWallet } from "./walletService";
import { uploadFileToCloudinary } from "./imageService";

// CONSTANTS
import { colors } from "@/constants/theme";

// TYPES
import { ResponseType, TransactionType, WalletType } from "@/types";

// UTILS
import { getLast12Months, getLast7Days, getYearsRange } from "@/utils/common";
import { scale } from "@/utils/styling";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, amount, type, walletId, image } = transactionData;
    if (!amount || amount <= 0 || !walletId || !type) {
      return {
        success: false,
        msg: "Invalid transaction data",
      };
    }
    if (id) {
      const oldTransactionSnapshot = await getDoc(
        doc(firestore, "transactions", id)
      );
      const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
      const shouldRevertOriginal =
        oldTransaction.type != type ||
        oldTransaction.amount != amount ||
        oldTransaction.walletId != walletId;

      if (shouldRevertOriginal) {
        let res = await revertAndUpdateWallets(
          oldTransaction,
          Number(amount),
          type,
          walletId
        );
        if (!res.success) {
          return res;
        }
      }
    } else {
      let res = await updateWalletForNewTransaction(
        walletId!,
        Number(amount!),
        type
      );
      if (!res.success) {
        return res;
      }
    }
    if (image) {
      const imageUploadRes = await uploadFileToCloudinary(
        image,
        "transactions"
      );
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload reciept",
        };
      }
      transactionData.image = imageUploadRes.data;
    }
    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));

    await setDoc(transactionRef, transactionData, { merge: true });

    return {
      success: true,
      data: { ...transactionData, id: transactionRef.id },
    };
  } catch (error: any) {
    console.log("error creating or updating the transaction: ", error.message);
    return {
      success: false,
      msg: error.message,
    };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
) => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);
    if (!walletSnapshot.exists()) {
      console.log("error updating wallet for a new transaction");
      return {
        success: false,
        msg: "wallet not found",
      };
    }
    const walletData = walletSnapshot.data() as WalletType;

    if (type == "expense" && walletData.amount! - amount < 0) {
      return {
        success: false,
        msg: "Selected wallet dont have enough balance",
      };
    }

    const updateType = type == "expense" ? "totalExpenses" : "totalIncome";
    const updatedWalletAmount =
      type == "expense"
        ? Number(walletData.amount) - amount
        : Number(walletData.amount) + amount;
    const updatedTotals =
      type == "expense"
        ? Number(walletData.totalExpenses) + amount
        : Number(walletData.totalIncome) + amount;
    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      [updateType]: updatedTotals,
    });
    return {
      success: true,
    };
  } catch (error: any) {
    console.log("error updating wallet for a new transaction", error);
    return {
      success: false,
      msg: error.message,
    };
  }
};

const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string
) => {
  try {
    const originalWalletSnapshot = await getDoc(
      doc(firestore, "wallets", oldTransaction.walletId)
    );

    const originalWallet = originalWalletSnapshot.data() as WalletType;
    let newWalletSnapshot = await getDoc(
      doc(firestore, "wallets", newWalletId)
    );
    let newWallet = newWalletSnapshot.data() as WalletType;
    const revertType =
      oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";
    const revertIncomeExpense: number =
      oldTransaction.type == "income"
        ? -Number(oldTransaction.amount)
        : Number(oldTransaction.amount);
    // wallet amount, After the transaction is reverted.
    const revertedWalletAmount =
      Number(originalWallet.amount) + revertIncomeExpense;

    const revertedIncomeExpenseAmount =
      Number(originalWallet[revertType]) - Number(oldTransaction.amount);

    if (newTransactionType == "expense") {
      // If user tries to convert income to expense on same wallet which leads to low balance.
      if (
        oldTransaction.walletId == newWalletId &&
        revertedWalletAmount < newTransactionAmount
      ) {
        return {
          success: false,
          msg: "The selected wallet dont have enough balance.",
        };
      }
      // If user tries to add expense from a new wallet but wallet dont have enough balance.
      if (newWallet.amount! < newTransactionAmount) {
        return {
          success: false,
          msg: "The selected wallet dont have enough balance.",
        };
      }
    }
    if (newTransactionType == "income") {
      // If user tries to change an income amount of walletA that has some transactions of expenses to another walletB. Then walletA balance is becoming negative. So, to avoid this we need to calculate totalexpense of walletA should not be less than changing income transaction amount.
      if (
        oldTransaction.type === "income" &&
        oldTransaction.walletId !== newWalletId
      ) {
        const incomeToRemove = Number(oldTransaction.amount);
        const originalWalletBalanceAfterRevert =
          Number(originalWallet.amount) - incomeToRemove;
        if (originalWalletBalanceAfterRevert < 0) {
          return {
            success: false,
            msg: "This wallet has existing expenses that would cause the balance to go negative if this income is moved.",
          };
        }
      }
    }
    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });

    // revert completed

    ////////////////

    // refetch the newWallet because we may just updated it.

    newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
    newWallet = newWalletSnapshot.data() as WalletType;

    const updateType =
      newTransactionType == "income" ? "totalIncome" : "totalExpenses";

    const updatedTransactionAmount: number =
      newTransactionType == "income"
        ? Number(newTransactionAmount)
        : -Number(newTransactionAmount);

    const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;
    const newIncomeExpenseAmount = Number(
      newWallet[updateType]! + Number(newTransactionAmount)
    );

    await createOrUpdateWallet({
      id: newWalletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    return { success: true };
  } catch (error: any) {
    console.log("error updating wallet for a new transaction", error);
    return {
      success: false,
      msg: error.message,
    };
  }
};

export const deleteTransaction = async (
  transactionId: string,
  walletId: string
) => {
  try {
    const transactionRef = doc(firestore, "transactions", transactionId);
    const transactionSnapshot = await getDoc(transactionRef);
    if (!transactionSnapshot.exists()) {
      return { success: false, msg: "transaction not found." };
    }
    const transactionData = transactionSnapshot.data() as TransactionType;
    const transactionType = transactionData.type;
    const transactionAmount = transactionData.amount;

    // fetch wallet to update amount, total Income and Expenses.
    const walletSnapshot = await getDoc(doc(firestore, "wallets", walletId));
    const walletData = walletSnapshot.data() as WalletType;

    // check fields to be updated based on transaction type
    const updateType =
      transactionType == "income" ? "totalIncome" : "totalExpenses";
    const newWalletAmount =
      walletData.amount! -
      (transactionType == "income" ? transactionAmount : -transactionAmount);
    const newIncomeExpenseAmount = walletData[updateType]! - transactionAmount;
    if (transactionType == "income" && newWalletAmount < 0) {
      return {
        success: false,
        msg: "you cant delete this transaction",
      };
    }
    await createOrUpdateWallet({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });
    await deleteDoc(transactionRef);
    return {
      success: true,
    };
  } catch (error: any) {
    console.log("error deleting transaction for new", error);
    return { success: false, msg: error.message };
  }
};

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const transactionQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );
    const querySnapshot = await getDocs(transactionQuery);
    const weeklyData = getLast7Days();
    const transactions: TransactionType[] = [];

    // mapping each transaction in day
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp)
        .toDate()
        .toISOString()
        .split("T")[0]; // as specific date

      const dayData = weeklyData.find((day) => day.date == transactionDate);

      if (dayData) {
        if (transaction.type == "income") {
          dayData.income += transaction.amount;
        } else if (transaction.type == "expense") {
          dayData.expense += transaction.amount;
        }
      }
    });

    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
      },
      {
        value: day.expense,
        frontColor: colors.rose,
      },
    ]);
    console.log("result", stats);
    return {
      success: true,
      data: {
        stats,
        transactions,
      },
    };
  } catch (error: any) {
    console.log("error fetching weekly stats", error);
    return { success: false, msg: error.message };
  }
};

export const fecthMonthlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

    const transactionQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(twelveMonthsAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );
    const querySnapshot = await getDocs(transactionQuery);
    const monthlyData = getLast12Months();
    const transactions: TransactionType[] = [];

    // mapping each transaction in day
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate();

      const monthName = transactionDate.toLocaleString("default", {
        month: "short",
      });

      const shortYear = transactionDate.getFullYear().toString().slice(-2);

      const monthData = monthlyData.find(
        (month) => month.month === `${monthName} ${shortYear}`
      );

      if (monthData) {
        if (transaction.type == "income") {
          monthData.income += transaction.amount;
        } else if (transaction.type == "expense") {
          monthData.expense += transaction.amount;
        }
      }
    });

    const stats = monthlyData.flatMap((month) => [
      {
        value: month.income,
        label: month.month,
        spacing: scale(4),
        labelWidth: scale(46),
        frontColor: colors.primary,
      },
      {
        value: month.expense,
        frontColor: colors.rose,
      },
    ]);
    return {
      success: true,
      data: {
        stats,
        transactions,
      },
    };
  } catch (error: any) {
    console.log("error fetching monthly stats", error);
    return { success: false, msg: error.message };
  }
};

export const fetchYearlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const transactionQuery = query(
      collection(db, "transactions"),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );
    const querySnapshot = await getDocs(transactionQuery);
    const transactions: TransactionType[] = [];

    const firstTransaction = querySnapshot.docs.reduce((earliest, doc) => {
      const transactionDate = doc.data().date.toDate();
      return transactionDate < earliest ? transactionDate : earliest;
    }, new Date());

    const firstYear = firstTransaction.getFullYear();
    const currentYear = new Date().getFullYear();

    const yearlyData = getYearsRange(firstYear, currentYear);

    // mapping each transaction in day
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionYear = (transaction.date as Timestamp)
        .toDate()
        .getFullYear();

      const yearData = yearlyData.find(
        (item: any) => item.year === transactionYear.toString()
      );

      if (yearData) {
        if (transaction.type == "income") {
          yearData.income += transaction.amount;
        } else if (transaction.type == "expense") {
          yearData.expense += transaction.amount;
        }
      }
    });

    const stats = yearlyData.flatMap((year: any) => [
      {
        value: year.income,
        label: year.year,
        spacing: scale(4),
        labelWidth: scale(35),
        frontColor: colors.primary,
      },
      {
        value: year.expense,
        frontColor: colors.rose,
      },
    ]);
    return {
      success: true,
      data: {
        stats,
        transactions,
      },
    };
  } catch (error: any) {
    console.log("error fetching yearly stats", error);
    return { success: false, msg: error.message };
  }
};
