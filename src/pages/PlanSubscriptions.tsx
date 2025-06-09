

const PlanSubscriptions = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$9.99',
      period: '/month',
      features: [
        '10 projects',
        '5 team members',
        '20GB storage',
        'Basic support',
        'Email assistance',
        'Community access'
      ],
      popular: false,
      accentColor: 'bg-green-500'
    },
    {
      name: 'Professional',
      price: '$29.99',
      period: '/month',
      features: [
        'Unlimited projects',
        '20 team members',
        '100GB storage',
        'Priority support',
        '24/7 chat assistance',
        'Advanced analytics',
        'API access'
      ],
      popular: true,
      accentColor: 'bg-blue-500'
    },
    {
      name: 'Enterprise',
      price: '$99.99',
      period: '/month',
      features: [
        'Unlimited projects',
        'Unlimited team members',
        '1TB storage',
        '24/7 premium support',
        'Dedicated account manager',
        'Advanced analytics',
        'API access',
        'Custom integrations',
        'White-glove onboarding'
      ],
      popular: false,
      accentColor: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Pricing Plans
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="mt-16 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative p-8 bg-white border-2 rounded-2xl shadow-sm flex flex-col ${
                plan.popular ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-semibold py-1 px-4 rounded-full">
                  Most popular
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">{plan.period}</span>
                </div>
                
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex">
                      <svg 
                        className={`flex-shrink-0 h-6 w-6 ${plan.accentColor.replace('bg', 'text')}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSubscriptions;