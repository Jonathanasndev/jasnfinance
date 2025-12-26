const transactionList = document.getElementById('transaction-list');
const incomeDisplay = document.getElementById('income-display');
const expenseDisplay = document.getElementById('expense-display');
const totalDisplay = document.getElementById('total-display');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');

let transactions = JSON.parse(localStorage.getItem('jasn_transactions')) || [];
let myChart; // Variável para armazenar a instância do gráfico

function addTransaction() {
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;

    if (description === '' || isNaN(amount) || amount <= 0) {
        alert("Preencha os campos corretamente!");
        return;
    }

    const transaction = {
        id: Math.floor(Math.random() * 1000000),
        description: description,
        amount: amount,
        type: type,
        date: new Date().toLocaleString('pt-BR')
    };

    transactions.push(transaction);
    updateApp();
    descriptionInput.value = '';
    amountInput.value = '';
    descriptionInput.focus();
}

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateApp();
}

// Função para Gerar/Atualizar o Gráfico
function updateChart(income, expense) {
    const ctx = document.getElementById('financeChart').getContext('2d');

    // Se o gráfico já existe, destrói para criar um novo com dados novos
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'doughnut', // Estilo Rosca (mais moderno)
        data: {
            labels: ['Entradas', 'Saídas'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#f8fafc' }
                }
            }
        }
    });
}

function updateApp() {
    transactionList.innerHTML = '';
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;

        const li = document.createElement('li');
        li.classList.add('transaction-item', t.type);
        li.innerHTML = `
            <div>
                <small style="display:block; font-size: 0.7rem; color: #94a3b8;">${t.date}</small>
                <span>${t.description}</span>
            </div>
            <div>
                <strong>${t.type === 'income' ? '' : '-'} R$ ${t.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
                <i class="fas fa-trash-alt delete-btn" style="margin-left:10px;" onclick="removeTransaction(${t.id})"></i>
            </div>
        `;
        transactionList.appendChild(li);
    });

    const total = income - expense;
    incomeDisplay.innerText = `R$ ${income.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    expenseDisplay.innerText = `R$ ${expense.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    totalDisplay.innerText = `R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    totalDisplay.style.color = total < 0 ? '#ef4444' : '#00f2fe';

    // Salva e atualiza o gráfico
    localStorage.setItem('jasn_transactions', JSON.stringify(transactions));
    updateChart(income, expense);
}

function exportToCSV() {
    if (transactions.length === 0) { alert("Não há dados!"); return; }
    let csvContent = "data:text/csv;charset=utf-8,Data;Descricao;Tipo;Valor\r\n";
    transactions.forEach(t => {
        csvContent += `${t.date};${t.description};${t.type === 'income' ? 'Entrada' : 'Saida'};${t.amount}\r\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "jasn_finance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

updateApp();