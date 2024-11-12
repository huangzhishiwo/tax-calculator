// 个税起征点
const TAX_THRESHOLD = 5000;

// 社保费率（个人缴纳部分）
const INSURANCE_RATES = {
    pension: 0.08,      // 养老保险
    medical: 0.02,      // 医疗保险
    unemployment: 0.005 // 失业保险
};

// 个税税率表
const TAX_RATES = [
    { threshold: 0, rate: 0.03, deduction: 0 },
    { threshold: 3000, rate: 0.1, deduction: 210 },
    { threshold: 12000, rate: 0.2, deduction: 1410 },
    { threshold: 25000, rate: 0.25, deduction: 2660 },
    { threshold: 35000, rate: 0.3, deduction: 4410 },
    { threshold: 55000, rate: 0.35, deduction: 7160 },
    { threshold: 80000, rate: 0.45, deduction: 15160 }
];

// 计算社保和公积金
function calculateInsurance(income, insuranceBase, housingFundBase, housingFundRate) {
    // 确保基数有效
    insuranceBase = insuranceBase || income;
    housingFundBase = housingFundBase || income;

    // 计算各项保险费用
    const pension = insuranceBase * INSURANCE_RATES.pension;
    const medical = insuranceBase * INSURANCE_RATES.medical;
    const unemployment = insuranceBase * INSURANCE_RATES.unemployment;
    const housingFund = housingFundBase * housingFundRate;

    return {
        pension,
        medical,
        unemployment,
        housingFund,
        total: pension + medical + unemployment + housingFund
    };
}

// 计算单月个税
function calculateMonthlyTax(income, insuranceTotal) {
    const taxableIncome = income - TAX_THRESHOLD - insuranceTotal;
    if (taxableIncome <= 0) return { tax: 0, rate: 0, taxableIncome: 0 };

    let taxRate = TAX_RATES[0];
    for (let i = TAX_RATES.length - 1; i >= 0; i--) {
        if (taxableIncome > TAX_RATES[i].threshold) {
            taxRate = TAX_RATES[i];
            break;
        }
    }

    const tax = taxableIncome * taxRate.rate - taxRate.deduction;
    return {
        tax: Math.max(tax, 0),
        rate: taxRate.rate,
        taxableIncome: taxableIncome
    };
}

// 更新月度表格
function updateMonthlyTable(monthlyIncome, insuranceBase, housingFundBase, housingFundRate) {
    const tableBody = document.getElementById('monthlyTableBody');
    tableBody.innerHTML = '';
    
    let totalTax = 0;
    let totalIncome = 0;
    let totalInsurance = 0;
    
    for (let month = 1; month <= 12; month++) {
        const insurance = calculateInsurance(monthlyIncome, insuranceBase, housingFundBase, housingFundRate);
        const taxResult = calculateMonthlyTax(monthlyIncome, insurance.total);
        const netIncome = monthlyIncome - insurance.total - taxResult.tax;
        
        totalTax += taxResult.tax;
        totalIncome += monthlyIncome;
        totalInsurance += insurance.total;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${month}月</td>
            <td>${insurance.pension.toFixed(2)}</td>
            <td>${insurance.medical.toFixed(2)}</td>
            <td>${insurance.unemployment.toFixed(2)}</td>
            <td>${insurance.housingFund.toFixed(2)}</td>
            <td>${taxResult.taxableIncome.toFixed(2)}</td>
            <td>${(taxResult.rate * 100).toFixed(0)}%</td>
            <td>${taxResult.tax.toFixed(2)}</td>
            <td>${netIncome.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    }
    
    // 更新年度汇总
    document.getElementById('annualIncome').textContent = totalIncome.toFixed(2);
    document.getElementById('annualInsurance').textContent = totalInsurance.toFixed(2);
    document.getElementById('annualTax').textContent = totalTax.toFixed(2);
    document.getElementById('annualNetIncome').textContent = (totalIncome - totalInsurance - totalTax).toFixed(2);
}

// 计算按钮点击事件处理函数
function calculateTax() {
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
    const insuranceBase = parseFloat(document.getElementById('insuranceBase').value) || monthlyIncome;
    const housingFundBase = parseFloat(document.getElementById('housingFundBase').value) || monthlyIncome;
    const housingFundRate = parseFloat(document.getElementById('housingFundRate').value);

    if (isNaN(monthlyIncome) || monthlyIncome < 0) {
        alert('请输入有效的月收入！');
        return;
    }

    updateMonthlyTable(monthlyIncome, insuranceBase, housingFundBase, housingFundRate);
} 