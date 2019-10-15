# Exploratory design mode for mass customization

Mass customization gives customers a chance to buy unique products that they’ll love. A typical product configurator tool uses a directed-design approach which allows customers to pick the base product, then make a series of selections based on a set of predefined attributes and options.

This prototype shows how customers could design their product using an exploratory design process. The configurator pre-renders a series of recommendations based on the Customer’s current selection. When the customer taps on a recommendation, it swaps places with the current selection, and a new set of recommendations render around the new selection.

This prototype has a few hardcoded recommendations based on Vans products. The sample starts with all options for each attribute being selected randomly. Then smaller variations on the selection are introduced.

A recommendations engine like Constructor.io could be used to drive which recommendations are shown. Constructor.io uses both customer behavior and product attributes to create a machine learning model that enhances the given recommendations. A weighted approach will put in front of customers more popular options and increase the chances of conversion.
