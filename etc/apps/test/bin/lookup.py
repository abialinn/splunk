#-*- coding:utf-8 -*-
'''
Created on 2013-6-18
@author: U
'''
import csv
import sys  
import logging

logger=logging.getLogger()
file=logging.FileHandler("test.log")
logger.addHandler(file)
logger.setLevel(logging.NOTSET)

DB_Path=('product_lookup.csv')

class baseProduct:
    Product={}
    def __init__(self,dbfile):
        self.dbfile=dbfile
        f=open(self.dbfile)
        db=csv.reader(f)
        for i in db:
            self.Product[i[0]]=i

    def getRecord(self,keyid):
        try:
            ProductInfo=[]
            ProductInfo=self.Product[keyid]
            return ProductInfo
        except:
            pass
MM=baseProduct(DB_Path) 

def main(): 
    r=csv.reader(sys.stdin)
    w=csv.writer(sys.stdout)
    header=[]
    first=True
    keyid=-1
    #r=[['product_id', 'product_type', 'product_name', 'price'],['AV-CB-01', '', '', ''],['FI-FW-02', '', '', ''],['FI-SW-01', '', '', ''],['FL-DLH-02', '', #'', ''],['FL-DSH-01', '', '', ''],['K9-BD-01', '', '', ''],['K9-CW-01', '', '', ''],['RP-LI-02', '', '', ''],['RP-SN-01', '', '', '']]
 
    for line in r: 
        header=line;
        logger.info(line)
        if first:
            try:
                keyid=header.index("product_id")
                print keyid
            except:
                print "product_id must exist in csv data"
                sys.exit(0)
            w.writerow(header)
            first=False
            continue
        try:
            infor = MM.getRecord(line[keyid])
        except: 
            continue
        line=infor
        logger.info("===========================")
        w.writerow(line)
        logger.info(line)
        
main()

