import ajouter from './assets/ajouter.jpg'
import depenser from './assets/depenser.jpg'
import coffre from './assets/logo.png'
import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'

function App() {
  const [montant, setMontant] = useState('')
  const [note, setNote] = useState('')
  const [transactions, setTransactions] = useState([])
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [loading, setLoading] = useState(true)

  // Charger les transactions depuis Supabase
  useEffect(() => {
    chargerTransactions()
  }, [])

  async function chargerTransactions() {
    setLoading(true)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.log('Erreur lors du chargement :', error)
      alert('Erreur Supabase : ' + error.message)
      setLoading(false)
      return
    }

    setTransactions(data || [])
    setLoading(false)
  }

  // Ajouter une transaction
  async function ajouterTransaction() {
     console.log("🔥 AJOUTER A ÉTÉ APPELÉ")
    const montantNumber = Number(montant)

    if (montantNumber <= 0) {
      alert('Entre un montant supérieur à 0')
      return
    }

    const transaction = {
      montant: montantNumber,
      note: note,
      date: new Date().toISOString(),
      type: 'ajout'
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()

    if (error) {
      console.log('Erreur :', error)
      alert('Erreur : ' + error.message)
      return
    }

    setTransactions([...data, ...transactions])
    setMontant('')
    setNote('')
  }

  // Dépenser
  async function depenserTransaction() {
    const montantNumber = Number(montant)

    if (montantNumber <= 0) {
      alert('Entre un montant supérieur à 0')
      return
    }

    if (solde < montantNumber) {
      alert('Solde insuffisant')
      return
    }

    const transaction = {
      montant: montantNumber,
      note: note,
      date: new Date().toISOString(),
      type: 'Depense'
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()

    if (error) {
      console.log('Erreur :', error)
      alert('Erreur : ' + error.message)
      return
    }

    setTransactions([...data, ...transactions])
    setMontant('')
    setNote('')
  }

  // Supprimer une transaction
  async function supprimerTransaction() {
    if (!selectedTransaction) {
      alert('Sélectionne dabord une transaction')
      return
    }

    const confirmation = window.confirm(
      'Tu veux vraiment supprimer cette transaction ?'
    )

    if (!confirmation) {
      return
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', selectedTransaction.id)

    if (error) {
      console.log('Erreur :', error)
      alert('Erreur : ' + error.message)
      return
    }

    setTransactions(
      transactions.filter(
        (transaction) => transaction.id !== selectedTransaction.id
      )
    )

    setSelectedTransaction(null)
  }

  // Reset complet
  async function reset() {
    const confirmation = window.confirm(
      'ATTENTION : supprimer toutes les transactions ?'
    )

    if (!confirmation) {
      return
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .not('id', 'is', null)

    if (error) {
      console.log('Erreur :', error)
      alert('Erreur : ' + error.message)
      return
    }

    setTransactions([])
    setSelectedTransaction(null)
  }

  // Calcul du solde
  const solde = transactions.reduce((total, transaction) => {
    if (transaction.type === 'ajout') {
      return total + Number(transaction.montant)
    }

    return total - Number(transaction.montant)
  }, 0)

  return (
    <main onClick={() => setSelectedTransaction(null)}>

      <h1>
        <img
          src={coffre}
          alt="logo"
          width="150"
          height="150"
        />
      </h1>

      <p>Solde : ${solde}</p>

      <input
        placeholder="Montant"
        type="number"
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
        onClick={(e) => {
          e.stopPropagation()
          ajouterTransaction()
        }}
      >
        <img src={ajouter} alt="Ajouter" />
      </button>

      <button
        className="depenser"
        onClick={(e) => {
          e.stopPropagation()
          depenserTransaction()
        }}
      >
        <img src={depenser} alt="Depenser" />
      </button>

      <div>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          transactions.map((transaction) => {
            const estSelectionnee =
              selectedTransaction?.id === transaction.id

            return (
              <p
                key={transaction.id}
                className={estSelectionnee ? 'selected' : ''}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTransaction(transaction)
                }}
              >
                {transaction.type === 'ajout' ? '+' : '-'}
                ${transaction.montant}
                {transaction.note ? ` : ${transaction.note}` : ''}
                {transaction.date
                  ? ` : ${new Date(
                      transaction.date
                    ).toLocaleDateString('fr-FR')}`
                  : ''}
              </p>
            )
          })
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          reset()
        }}
      >
        reset
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          supprimerTransaction()
        }}
      >
        supprimer la transaction
      </button>

    </main>
  )
}

export default App