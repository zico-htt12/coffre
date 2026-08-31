
import ajouter from './assets/ajouter.jpg'
import depenser from './assets/depenser.jpg'
import coffre from './assets/logo.png'
import { useState, useEffect } from 'react'
import './App.css'


function App() {
  const [montant, setMontant] = useState('')
  const [solde, setSolde] = useState(() => {
    const savedSolde = localStorage.getItem('solde')
    if (savedSolde) {
      return Number(savedSolde)
    }
    return 0
  })
  const [note, setNote] = useState('')
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('transactions')

    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions)
      return transactions.map((transaction) => {
        return {
          ...transaction,
          date: new Date(transaction.date)
        }
      })
    }

    return []
  })
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('solde', solde)
  }, [solde]
  )

  return (
    <main onClick={()=>setSelectedTransaction(null)}>
      <h1><img src={coffre} alt="logo" width="150" height="150" /></h1>
      <p>Solde : ${solde}</p>
      <input
        placeholder="Montant"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
      />
      <p />
      <input
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}

      />

      <p>Montant entré : {montant}</p>
      <button
        className="ajouter"
        onClick={() => {
          if (Number(montant) > 0) {
            const transaction = {
              montant: Number(montant),
              note: note,
              date: new Date(),
              type: 'ajout'
            }
            setTransactions([...transactions, transaction])
            setSolde(solde + Number(montant))
            setMontant('')
            setNote('')
          }
        }}>
        <img src={ajouter} alt="Ajouter" /></button>
      <button
        className="depenser"
        onClick={() => {

          if (solde >= Number(montant) && Number(montant) > 0) {
            const transaction = {
              montant: Number(montant),
              note: note,
              date: new Date(),
              type: 'Depense'
            }
            setTransactions([...transactions, transaction])
            setSolde(solde - Number(montant))
            setMontant('')
            setNote('')
          }
        }}>
        <img src={depenser} alt="Depenser" /></button>

      <div>
        {transactions.map((transaction) => {
          return (

            <p
              className={selectedTransaction === transaction ? 'selected' : ''}
              onClick={(e) =>{ 
              e.stopPropagation()
              setSelectedTransaction(transaction)}}>
              {transaction.type === 'ajout' ? '+' : '-'}
              ${transaction.montant} : {transaction.note}
              : {transaction.date.toLocaleDateString('fr-FR')}
            </p>

          )

        })
        }

      </div>

      <button onClick={() => {
        setSolde(0)
        setTransactions([])
      }
      }>
        reset
      </button>

      <button onClick={() => {
        if (selectedTransaction) {
          const nouvelleTransac = transactions.filter((transaction) => { return transaction !== selectedTransaction })
          setTransactions(nouvelleTransac)
          if (selectedTransaction.type == 'ajout') {
            setSolde(solde - selectedTransaction.montant)
          }
          else {
            setSolde(solde + selectedTransaction.montant)
          }

          setSelectedTransaction(null)
        }
      }}>
        supprimer la transaction
      </button>
    </main>


  )
}
export default App;