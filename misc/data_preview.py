#
# Preview the datasets to see which features are useful for the final product
#
from __future__ import print_function
from matplotlib import pyplot as plt
import numpy as np
import datetime as dt
import csv

#-------------------------------------------------------------------------------
def temperature():
  f = open('data/GlobalLandTemperatures/GlobalLandTemperaturesByCountry.csv')
  csv_f = csv.DictReader(f)

  x, y = [], []

  for row in csv_f:
    if row["AverageTemperature"] != "" and row["AverageTemperatureUncertainty"] != "" and row["Country"] == "Senegal" and row["dt"][5]=="1" and row["dt"][6]=="1":
      x.append(dt.datetime.strptime(row["dt"], "%Y-%m-%d").date())
      y.append(float(row["AverageTemperature"]))

  plt.plot(x, y, linewidth=2.0)
  plt.show()

#-------------------------------------------------------------------------------
def energy():
  f = open("data/WorldBank_EnergyConsumption/API_EG.USE.PCAP.KG.OE_DS2_en_csv_v2.csv")
  csv_f = csv.DictReader(f)

  labels, x, y1, y2, y3 = [], [], [], [], []

  for row in csv_f:
    if row["1960"] != "":
      labels.append(row["Country Code"])
      y1.append(float(row["1960"]))
      y2.append(float(row["1980"]))
      y3.append(float(row["2000"]))
  
  x = np.arange(1, len(labels) + 1, 1)

  plt.plot(x, y1)
  plt.plot(x, y2)
  plt.plot(x, y3)
  plt.xticks(x, labels, rotation='vertical')
  plt.show()      

#-------------------------------------------------------------------------------
def carbon():
  f = open("data/WorldBank_CO2/API_EN.ATM.CO2E.KT_DS2_en_csv_v2.csv")
  csv_f = csv.DictReader(f)

  labels, x, y1, y2, y3 = [], [], [], [], []

  for row in csv_f:
    if row["1960"] != "":
      labels.append(row["Country Code"])
      y1.append(float(row["1960"]))
      y2.append(float(row["1980"]))
      y3.append(float(row["2000"]))
  
  x = np.arange(1, len(labels) + 1, 1)

  plt.plot(x, y1)
  plt.xticks(x, labels, rotation='vertical')
  plt.show()    

#
# Main
#
temperature()
#energy()
#carbon()
